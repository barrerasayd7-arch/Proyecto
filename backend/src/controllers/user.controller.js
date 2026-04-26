import sql from "mssql";
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =========================
   GET USUARIOS (PROTEGIDO)
========================= */
export const getUsuarios = async (req, res) => {
  try {
    const conn = await pool;

    const result = await conn.request().query(`
      SELECT 
        id_usuario,
        telefono,
        nombre,
        descripcion,
        correo,
        estado,
        fecha_registro,
        universidad,
        avatar
      FROM usuarios
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   REGISTER
========================= */
export const register = async (req, res) => {
  const { correo, password, nombre, telefono, codigo } = req.body;

  if (!correo || !password || !nombre) {
    return res.status(400).json({ error: "Correo, contraseña y nombre son obligatorios" });
  }

  try {
    const conn = await pool;

    // 2. Importar el diccionario y validar el código
    const { codigosTemporales } = await import("./auth.controller.js");
    
    if (!codigosTemporales[correo] || String(codigosTemporales[correo]) !== String(codigo)) {
      return res.status(400).json({ error: "Código inválido o expirado. Verifica de nuevo." });
    }

    // 🔎 Verificar si el correo ya existe
    const existing = await conn.request()
      .input("correo", sql.NVarChar, correo)
      .query("SELECT id_usuario FROM usuarios WHERE correo = @correo");

    if (existing.recordset.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // 🔐 Hash password
    const hash = await bcrypt.hash(password, 10);

    // Usamos el Store Procedure que acabas de actualizar
    await conn.request()
      .input("correo", sql.NVarChar, correo)
      .input("password_hash", sql.NVarChar, hash)
      .input("nombre", sql.NVarChar, nombre)
      .input("telefono", sql.NVarChar, telefono || null)
      .execute("sp_CrearUsuario"); // Usar .execute para Procedures


      // 4. ELIMINACIÓN: Si todo salió bien, borramos el código
    delete codigosTemporales[correo];

    res.status(201).json({ message: "Usuario creado correctamente" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
  }

  try {
    const conn = await pool;

    const result = await conn.request()
      .input("correo", sql.VarChar, correo)
      .query("SELECT * FROM usuarios WHERE correo = @correo");

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ message: "Usuario no existe" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Quitar password del response
    const { password_hash, ...safeUser } = user;

    const token = jwt.sign(
      { id: user.id_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: safeUser });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* =========================
   GET USUARIO POR ID
========================= */
export const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await pool;
    const result = await conn.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT 
          u.id_usuario,
          u.nombre,
          u.descripcion,
          u.correo,
          u.estado,
          u.fecha_registro,
          u.avatar,
          u.universidad,
          (SELECT COUNT(*) FROM seguidores WHERE id_seguido  = u.id_usuario) AS total_seguidores,
          (SELECT COUNT(*) FROM seguidores WHERE id_seguidor = u.id_usuario) AS total_siguiendo,
          (SELECT COUNT(*) FROM servicios  WHERE id_proveedor = u.id_usuario) AS total_publicaciones,
          (SELECT ISNULL(AVG(CAST(puntuacion AS FLOAT)), 0) FROM calificaciones WHERE id_servicio IN (SELECT id_servicio FROM servicios WHERE id_proveedor = u.id_usuario)) AS reputacion
        FROM usuarios u
        WHERE u.id_usuario = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/* =========================
   VERIFY TOKEN (MIDDLEWARE)
========================= */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token enviado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido" });
  }
};


export const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const campos = req.body; // { nombre, correo, descripcion, avatar, estado }

  const columnas = Object.keys(campos)
    .map(k => `${k} = @${k}`)
    .join(", ");

  try {
    const conn = await pool;
    const request = conn.request().input("id", sql.Int, id);
    for (const [k, v] of Object.entries(campos)) {
      request.input(k, v);
    }
    await request.query(`UPDATE usuarios SET ${columnas} WHERE id_usuario = @id`);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   SOLICITAR RESET DE CONTRASEÑA
   Verifica que el correo exista y envía código de verificación
========================= */
export const solicitarResetPassword = async (req, res) => {
  const { correo } = req.body;
  if (!correo) return res.status(400).json({ error: "Correo requerido" });

  try {
    const conn = await pool;
    // Verificar que el correo existe en la base
    const result = await conn.request()
      .input("correo", sql.NVarChar, correo)
      .query("SELECT id_usuario FROM usuarios WHERE correo = @correo");

    if (result.recordset.length === 0) {
      // Por seguridad respondemos igual aunque no exista
      return res.json({ message: "Si el correo existe, recibirás un código" });
    }

    // Reusar el endpoint de envío de código que ya tienes
    const { enviarCodigo } = await import("./auth.controller.js");
    return enviarCodigo(req, res);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   CAMBIAR CONTRASEÑA CON CÓDIGO
========================= */
export const resetPassword = async (req, res) => {
  const { correo, codigo, nuevaPassword } = req.body;

  try {
    // 1. Importamos el diccionario que ahora SÍ está exportado
    const { codigosTemporales } = await import("./auth.controller.js");

    // 2. Verificamos si existe el diccionario y el código coincide
    if (!codigosTemporales || codigosTemporales[correo] !== String(codigo)) {
      return res.status(400).json({ error: "Código incorrecto o expirado" });
    }

    // 3. Si es válido, procedemos al cambio en SQL Server
    const hash = await bcrypt.hash(nuevaPassword, 10);
    const conn = await pool;
    
    await conn.request()
      .input("correo", sql.NVarChar, correo)
      .input("hash", sql.NVarChar, hash)
      .query("UPDATE usuarios SET password_hash = @hash WHERE correo = @correo");

    // 4. Borramos el código para que no se use dos veces
    delete codigosTemporales[correo];

    res.json({ ok: true, message: "Contraseña actualizada" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno al resetear password" });
  }
};