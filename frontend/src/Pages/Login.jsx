import { useState, useEffect } from "react";
import "../styles/styleLogin.css";
import { useNavigate } from "react-router-dom";
import logoIcon from "../img/logo_color_noBG.png";

// ══════════════════════════════════════════════════════════════════
// CREDENCIALES DE ADMINISTRADOR HARDCODEADAS
// Estas credenciales permiten acceso directo al panel de admin
// sin pasar por la base de datos. Solo para propósitos de prueba.
// IMPORTANTE: En producción deben eliminarse y manejarse desde el backend.
// Formato: { correo: "...", password: "..." }
// ══════════════════════════════════════════════════════════════════
const ADMIN_CREDENTIALS = [
  { correo: "admin@uniservice.co", password: "admin123" },
  { correo: "frank@uniservice.co", password: "frank2026" },
  { correo: "lenin@uniservice.co", password: "lenin2026" },
  { correo: "sayd@uniservice.co", password: "sayd2026" },
  { correo: "andres@uniservice.co", password: "andres2026" },
];

// Contraseña maestra adicional que se pide en el modal de confirmación de admin.
// Es un segundo factor de seguridad antes de entrar al panel de administración.
const ADMIN_MASTER_PASSWORD = "admin_2026";

export default function Login() {
  // Hook de React Router para redirigir al usuario entre páginas
  const navigate = useNavigate();

  // ════════════════════════════════
  // ESTADOS DEL FORMULARIO DE LOGIN
  // Guardan lo que el usuario escribe en los campos de inicio de sesión
  // ════════════════════════════════
  const [correo, setCorreo] = useState("");   // Campo correo del login
  const [pass, setPass] = useState("");       // Campo contraseña del login

  // ════════════════════════════════
  // ESTADOS DEL FORMULARIO DE REGISTRO
  // Guardan los datos del formulario de crear cuenta nueva
  // ════════════════════════════════
  const [nombre, setNombre] = useState("");       
  const [correoReg, setCorreoReg] = useState(""); 
  const [passReg, setPassReg] = useState("");     
  const [passReg2, setPassReg2] = useState("");   
  const [terminos, setTerminos] = useState(false); 

  // ════════════════════════════════
  // ESTADOS DEL FLUJO DE VERIFICACIÓN DE CORREO
  // Controlan el proceso de envío y validación del código de 6 dígitos
  // que se envía al correo antes de poder registrarse
  // ════════════════════════════════
  const [codigoEnviado, setCodigoEnviado] = useState(false);       
  const [codigoInput, setCodigoInput] = useState("");               
  const [correoVerificado, setCorreoVerificado] = useState(false);  
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);      
  const [mostrarModalCodigo, setMostrarModalCodigo] = useState(false); 

  // ════════════════════════════════
  // ESTADOS DEL FLUJO "OLVIDÉ MI CONTRASEÑA"
  // Manejan los 3 pasos del proceso de recuperación:
  //   1. "correo"  → el usuario ingresa su correo
  //   2. "codigo"  → el usuario ingresa el código recibido
  //   3. "nueva"   → el usuario escribe su nueva contraseña
  // ════════════════════════════════
  const [resetPaso, setResetPaso] = useState(null);     // Paso actual del flujo (null = modal cerrado)
  const [resetCorreo, setResetCorreo] = useState("");   // Correo ingresado para recuperar
  const [resetCodigo, setResetCodigo] = useState("");   // Código de verificación recibido
  const [resetPass, setResetPass] = useState("");       // Nueva contraseña
  const [resetPass2, setResetPass2] = useState("");     // Confirmación de nueva contraseña
  const [resetCargando, setResetCargando] = useState(false); // Deshabilita botones mientras espera la API

  // ════════════════════════════════
  // ESTADOS DEL MODAL DE ACCESO ADMIN
  // Controlan el comportamiento del modal que aparece cuando
  // se detecta que el usuario es administrador
  // ════════════════════════════════
  const [modalAdmin, setModalAdmin] = useState(false);         // Si el modal está visible
  const [adminMasterInput, setAdminMasterInput] = useState(""); // Contraseña maestra que escribe el admin
  const [adminIntentos, setAdminIntentos] = useState(3);        // Contador de intentos fallidos (máx 3)
  const [adminBloqueado, setAdminBloqueado] = useState(false);  // Si se bloqueó por demasiados intentos
  const [adminError, setAdminError] = useState("");             // Mensaje de error dentro del modal
  const [adminLoginData, setAdminLoginData] = useState(null);   // Datos del usuario admin (reservado para uso futuro)
  const [adminShake, setAdminShake] = useState(false);          // Activa animación de "shake" cuando falla

  // ════════════════════════════════
  // ESTADOS GENERALES DE UI
  // ════════════════════════════════
  const [errores, setErrores] = useState({}); // Objeto con mensajes de error por campo (ej: { correo: "Inválido" })
  const [modal, setModal] = useState({        // Modal genérico para mostrar mensajes al usuario
    visible: false,
    mensaje: "",
    tipo: "error", // Puede ser "error", "success" o "info"
  });

  // Función helper para mostrar el modal de notificación con un mensaje y tipo dados
  const notificar = (mensaje, tipo = "error") =>
    setModal({ visible: true, mensaje, tipo });

  // ════════════════════════════════
  // VALIDACIONES DE CAMPOS
  // Cada función valida un campo específico en tiempo real mientras el usuario escribe.
  // Actualiza el estado del campo Y el objeto de errores al mismo tiempo.
  // ════════════════════════════════

  // Valida que el correo tenga formato válido (algo@algo.algo)
  // El parámetro "tipo" diferencia si es el campo del login o el del registro
  const validarCorreo = (email, tipo = "login") => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const esValido = regex.test(email);
    if (tipo === "login") {
      setCorreo(email);
      setErrores((prev) => ({
        ...prev,
        correo: esValido ? "" : "Correo inválido",
      }));
    } else {
      setCorreoReg(email);
      setErrores((prev) => ({
        ...prev,
        correoReg: esValido ? "" : "Correo inválido",
      }));
    }
  };

  // Valida que la contraseña del login tenga al menos 8 caracteres
  const validarPassLogin = (value) => {
    setPass(value);
    setErrores((prev) => ({
      ...prev,
      pass: value.length < 8 ? "Mínimo 8 caracteres" : "",
    }));
  };

  // Valida el nombre: mínimo 3 caracteres, máximo 50
  const validarNombre = (value) => {
    setNombre(value);
    if (value.trim().length < 3)
      setErrores((prev) => ({ ...prev, nombre: "Mínimo 3 caracteres" }));
    else if (value.length > 50)
      setErrores((prev) => ({ ...prev, nombre: "Nombre muy largo" }));
    else setErrores((prev) => ({ ...prev, nombre: "" }));
  };

  // Valida la contraseña del registro. También re-valida la confirmación
  // si ya tiene algo escrito, para que el error de "no coinciden" se actualice
  const validarPassReg = (value) => {
    setPassReg(value);
    setErrores((prev) => ({
      ...prev,
      passReg: value.length < 8 ? "Mínimo 8 caracteres" : "",
      ...(passReg2 && {
        passReg2: value !== passReg2 ? "Las contraseñas no coinciden" : "",
      }),
    }));
  };

  // Valida la confirmación de contraseña comparándola con la original
  const validarPassReg2 = (value) => {
    setPassReg2(value);
    if (value.length < 8)
      setErrores((prev) => ({ ...prev, passReg2: "Mínimo 8 caracteres" }));
    else if (value !== passReg)
      setErrores((prev) => ({
        ...prev,
        passReg2: "Las contraseñas no coinciden",
      }));
    else setErrores((prev) => ({ ...prev, passReg2: "" }));
  };

  // ════════════════════════════════
  // VERIFICACIÓN DE CORREO (REGISTRO)
  // Llama a la API para enviar el código de 6 dígitos al correo del usuario.
  // El backend genera el código, lo guarda temporalmente (5 min) y lo envía por email.
  // ════════════════════════════════
  const handleEnviarCodigo = async () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoReg || !regex.test(correoReg)) {
      notificar("❌ Ingresa un correo válido primero");
      return;
    }
    setEnviandoCodigo(true); // Cambia el botón a "Enviando..."
    try {
      const res = await fetch("https://localhost:7237/api/Auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoReg }),
      });
      if (res.ok) {
        setCodigoEnviado(true);
        setMostrarModalCodigo(true); // Abre el modal para que el usuario ingrese el código
      } else {
        notificar("❌ Error al enviar el código");
      }
    } catch {
      notificar("❌ Error de conexión");
    } finally {
      setEnviandoCodigo(false); // Restaura el botón sin importar si fue exitoso o no
    }
  };

  // Envía el código que escribió el usuario a la API para verificarlo.
  // Si es correcto, marca el correo como verificado y cierra el modal.
  const handleVerificarCodigo = async () => {
    if (codigoInput.length !== 6) {
      notificar("❌ El código debe tener 6 dígitos");
      return;
    }
    try {
      const res = await fetch("https://localhost:7237/api/Auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoReg, codigo: codigoInput }),
      });
      const data = await res.json();
      if (data.valido) {
        setCorreoVerificado(true);         // Habilita el botón de crear cuenta
        setMostrarModalCodigo(false);      // Cierra el modal del código
        notificar("✅ Correo verificado con éxito", "success");
      } else {
        notificar("❌ Código incorrecto, intenta de nuevo");
      }
    } catch {
      notificar("❌ Error en la verificación");
    }
  };

  // ════════════════════════════════
  // FLUJO "OLVIDÉ MI CONTRASEÑA"
  // Son 3 pasos: enviar código → verificar código → guardar nueva contraseña
  // ════════════════════════════════

  // PASO 1: Pide al backend que envíe un código de recuperación al correo ingresado
  const handleResetEnviarCodigo = async () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!resetCorreo || !regex.test(resetCorreo)) {
      notificar("❌ Ingresa un correo válido");
      return;
    }
    setResetCargando(true);
    try {
      const res = await fetch(
        "https://localhost:7237/api/Auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo: resetCorreo }),
        },
      );
      if (res.ok) {
        setResetPaso("codigo"); // Avanza al paso 2: ingresar el código
      } else {
        notificar("❌ Error al enviar el código");
      }
    } catch {
      notificar("❌ Error de conexión");
    } finally {
      setResetCargando(false);
    }
  };

  // Permite reenviar el código si el usuario no lo recibió o expiró
  const handleResetReenviarCodigo = async () => {
    setResetCargando(true);
    try {
      await fetch("https://localhost:7237/api/Auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: resetCorreo }),
      });
      notificar("📧 Código reenviado", "success");
    } catch {
      notificar("❌ Error al reenviar");
    } finally {
      setResetCargando(false);
    }
  };

  // PASO 2: Verifica que el código de recuperación ingresado sea correcto
  const handleResetVerificarCodigo = async () => {
    if (resetCodigo.length !== 6) {
      notificar("❌ El código debe tener 6 dígitos");
      return;
    }
    setResetCargando(true);
    try {
      const res = await fetch("https://localhost:7237/api/Auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: resetCorreo, codigo: resetCodigo }),
      });
      const data = await res.json();
      if (data.valido) {
        setResetPaso("nueva"); // Avanza al paso 3: escribir la nueva contraseña
      } else {
        notificar("❌ Código incorrecto o expirado");
      }
    } catch {
      notificar("❌ Error de conexión");
    } finally {
      setResetCargando(false);
    }
  };

  // PASO 3: Envía la nueva contraseña al backend para guardarla en la base de datos
  const handleResetGuardar = async () => {
    if (resetPass.length < 8) {
      notificar("❌ La contraseña debe tener mínimo 8 caracteres");
      return;
    }
    if (resetPass !== resetPass2) {
      notificar("❌ Las contraseñas no coinciden");
      return;
    }
    setResetCargando(true);
    try {
      const res = await fetch(
        "https://localhost:7237/api/Auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo: resetCorreo,
            codigo: resetCodigo,
            nuevaPassword: resetPass,
          }),
        },
      );
      const data = await res.json();
      if (data.ok) {
        notificar(
          "✅ Contraseña cambiada correctamente. Ya puedes iniciar sesión.",
          "success",
        );
        // Limpia todos los estados del flujo de recuperación y cierra el modal
        setResetPaso(null);
        setResetCorreo("");
        setResetCodigo("");
        setResetPass("");
        setResetPass2("");
      } else {
        notificar("❌ " + (data.error || "Error al cambiar contraseña"));
      }
    } catch {
      notificar("❌ Error de conexión");
    } finally {
      setResetCargando(false);
    }
  };

  // Cierra el modal de recuperación y limpia todos sus campos
  const cerrarModalReset = () => {
    setResetPaso(null);
    setResetCorreo("");
    setResetCodigo("");
    setResetPass("");
    setResetPass2("");
  };

  // ════════════════════════════════
  // MODAL DE ACCESO ADMIN
  // Segundo factor de seguridad: aunque el login detecte un admin,
  // debe ingresar la contraseña maestra para entrar al panel.
  // Tiene un límite de 3 intentos antes de bloquearse.
  // ════════════════════════════════

  // Cierra el modal y resetea todos sus estados a valores iniciales
  const cerrarModalAdmin = () => {
    setModalAdmin(false);
    setAdminMasterInput("");
    setAdminError("");
    setAdminIntentos(0);
    setAdminBloqueado(false);
  };

  // Valida la contraseña maestra. Si es correcta redirige al dashboard.
  // Si es incorrecta, incrementa el contador. Al llegar a 3 bloquea el acceso.
  const handleAdminConfirmar = () => {
    if (adminBloqueado) return; // No hace nada si ya está bloqueado

    if (adminMasterInput === ADMIN_MASTER_PASSWORD) {
      notificar("🔓 Acceso concedido, Comandante", "success");
      setModalAdmin(false);

      // Guarda en localStorage que el usuario está logueado como admin
      localStorage.setItem("logueado", "true");
      localStorage.setItem("usuarioRol", "1");

      // Espera 1 segundo para que el usuario vea el mensaje de éxito antes de redirigir
      setTimeout(() => {
        navigate("/admin-dashboard", { replace: true });
      }, 1000);
    } else {
      const nuevosIntentos = adminIntentos + 1;
      setAdminIntentos(nuevosIntentos);

      // Activa la animación de shake (temblor) en el modal para indicar error
      setAdminShake(true);
      setTimeout(() => setAdminShake(false), 500);

      if (nuevosIntentos >= 3) {
        setAdminBloqueado(true); // Bloquea el formulario definitivamente
        setAdminError("DEMASIADOS INTENTOS FALLIDOS. ACCESO DENEGADO.");
      } else {
        setAdminError(`Contraseña incorrecta. Intento ${nuevosIntentos} de 3.`);
      }
    }
  };

  // ════════════════════════════════
  // LÓGICA DE LOGIN
  // Tiene dos caminos:
  //   1. Si el correo/pass coinciden con ADMIN_CREDENTIALS → abre el modal admin (sin ir al backend)
  //   2. Si no → llama al backend C# para autenticar normalmente
  // ════════════════════════════════
  const handleLogin = async () => {
    // Validaciones básicas antes de llamar a la API
    if (!correo || errores.correo) {
      notificar("❌ Ingresa un correo válido");
      return;
    }
    if (pass.length < 8) {
      notificar("❌ Mínimo 8 caracteres");
      return;
    }

    // BYPASS ADMIN: Busca si las credenciales coinciden con algún admin hardcodeado.
    // Si encuentra coincidencia, no va al backend: abre el modal directamente.
    const adminEncontrado = ADMIN_CREDENTIALS.find(
      (a) => a.correo === correo && a.password === pass,
    );

    if (adminEncontrado) {
      localStorage.setItem("usuario", adminEncontrado.correo.split("@")[0]);
      localStorage.setItem("usuarioRol", 1);
      setModalAdmin(true);
      notificar("🔑 Cuenta de administrador detectada", "info");
      return; // Detiene la función aquí, no llega al fetch del backend
    }

    // FLUJO NORMAL: Si no es un admin hardcodeado, autentica contra la base de datos
    try {
      const res = await fetch("http://localhost:5165/api/Users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password: pass }),
      });
      const data = await res.json();

      if (data.token) {
        // Guarda el token JWT y los datos del usuario en localStorage para mantener la sesión
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuarioId", data.user.id);
        localStorage.setItem("usuarioRol", data.user.id_rol);
        localStorage.setItem("logueado", "true");

        // Si el backend indica que es admin (rol 1), abre el modal de verificación
        // Si es usuario normal (rol 2), redirige directo al home
        if (data.user.id_rol === 1) {
          setModalAdmin(true);
        } else {
          navigate("/home", { replace: true });
        }
      } else {
        notificar("❌ " + (data.message || "Credenciales incorrectas"));
      }
    } catch {
      notificar("❌ Error de conexión con el servidor");
    }
  };

  // ════════════════════════════════
  // LÓGICA DE REGISTRO
  // Crea una cuenta nueva en el backend. Requiere que el correo
  // haya sido verificado previamente con el código de 6 dígitos.
  // ════════════════════════════════
  const handleRegister = async () => {
    // No permite registrar si el correo no fue verificado con el código
    if (!correoVerificado) {
      notificar("❌ Debes verificar tu correo primero");
      return;
    }
    // Validación completa del formulario antes de enviar
    if (
      passReg.length < 8 ||
      passReg !== passReg2 ||
      nombre.trim().length < 3 ||
      !terminos
    ) {
      notificar("❌ Revisa los campos del formulario");
      return;
    }
    try {
      const res = await fetch("https://localhost:7237/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: correoReg,
          password: passReg,
          nombre: nombre.trim(),
          codigo: codigoInput, // El backend valida que el código siga siendo válido
        }),
      });
      const data = await res.json();
      if (data.error) {
        notificar("❌ " + data.error);
      } else {
        notificar("✅ Cuenta creada, ya puedes iniciar sesión", "success");
        // Limpia todos los campos del formulario de registro después de crear la cuenta
        setNombre("");
        setCorreoReg("");
        setPassReg("");
        setPassReg2("");
        setTerminos(false);
        setErrores({});
        setCorreoVerificado(false);
        setCodigoEnviado(false);
        setCodigoInput("");
      }
    } catch {
      notificar("❌ Error de conexión");
    }
  };

  // ════════════════════════════════
  // EFECTO DE CLASE CSS EN EL BODY
  // Añade la clase "login-page" al body mientras esta página está montada.
  // Esto permite aplicar estilos globales específicos solo para la página de login
  // (como fondo diferente). Se elimina automáticamente al salir de la página.
  // ════════════════════════════════
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page"); // Limpieza al desmontar
  }, []);

  // ════════════════════════════════
  // RENDERIZADO (JSX)
  // La estructura visual usa dos radios ocultos (#r-login y #r-reg)
  // para controlar qué panel (login o registro) se muestra,
  // usando solo CSS sin necesidad de estado de React para el tab activo.
  // ════════════════════════════════
  return (
    <>
      {/* Radios ocultos que controlan qué tab está activa mediante CSS puro */}
      <input
        type="radio"
        className="tab-radio"
        name="tab"
        id="r-login"
        defaultChecked
      />
      <input type="radio" className="tab-radio" name="tab" id="r-reg" />

      <div className="auth-wrapper">
        <div className="auth-box">
          {/* ── COLUMNA IZQUIERDA: Logo y descripción de la plataforma ── */}
          <div className="auth-lateral">
            <div className="lateral-contenido">
              <div className="lateral-icono">
                <img
                  src={logoIcon}
                  alt="UniServices Logo"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
              <h2>
                Uni
                <span style={{ color: "#0ea5a0", fontWeight: "bold" }}>
                  Service
                </span>
              </h2>
              <p className="lateral-desc">
                Intercambia tutorías, proyectos, diseño y más con otros
                estudiantes universitarios.
              </p>
              {/* Chips decorativos que muestran las categorías disponibles */}
              <div className="lateral-chips">
                {[
                  "📚 Tutorías",
                  "💻 Programación",
                  "✍️ Ensayos",
                  "🎨 Diseño",
                  "⚡ Productos",
                  "🏠 Arriendo",
                ].map((c) => (
                  <span key={c} className="lateral-chip">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── COLUMNA DERECHA: Formularios de login y registro ── */}
          <div className="auth-formulario">
            <div className="auth-logo">
              <p className="auth-pretitle">Bienvenido 👋</p>
              <h1 className="auth-title">
                Accede a la <span>plataforma</span>
              </h1>
              <p className="auth-subtitle">
                Convierte tu conocimiento en oportunidades y encuentra ayuda
                cuando la necesites.
              </p>
            </div>

            {/* Tabs que alternan entre "Iniciar sesión" y "Registrarse" usando CSS */}
            <div className="tabs">
              <label className="tab" htmlFor="r-login">
                Iniciar sesión
              </label>
              <label className="tab" htmlFor="r-reg">
                Registrarse
              </label>
            </div>

            {/* ── PANEL LOGIN ── */}
            <div className="form-panel" id="panel-login">
              {/* Campo de correo con validación en tiempo real */}
              <div className="campo">
                <label className="campo-label">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={correo}
                  onChange={(e) => validarCorreo(e.target.value, "login")}
                />
                {errores.correo && (
                  <span className="error-msg">{errores.correo}</span>
                )}
              </div>

              {/* Campo de contraseña con validación de longitud mínima */}
              <div className="campo">
                <label className="campo-label">Contraseña</label>
                <input
                  type="password"
                  placeholder="Tu contraseña"
                  value={pass}
                  onChange={(e) => validarPassLogin(e.target.value)}
                />
                {errores.pass && (
                  <span className="error-msg">{errores.pass}</span>
                )}
              </div>

              {/* Botón que abre el flujo de recuperación de contraseña */}
              <div className="olvide">
                <button
                  type="button"
                  className="btn-olvide"
                  onClick={() => setResetPaso("correo")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="botones-login">
                <button
                  className="btn-principal"
                  type="button"
                  onClick={handleLogin}
                >
                  Entrar →
                </button>
                {/* Permite explorar la app sin cuenta */}
                <button
                  className="btn-secundario"
                  onClick={() => navigate("/home-guest")}
                >
                  Entrar como invitado
                </button>
              </div>

              <p className="pie">
                ¿No tienes cuenta?{" "}
                <label className="pie-link" htmlFor="r-reg">
                  Regístrate gratis
                </label>
              </p>
            </div>

            {/* ── PANEL REGISTRO ── */}
            <div className="form-panel" id="panel-reg">
              {/* Campo nombre con validación de longitud */}
              <div className="campo">
                <label className="campo-label">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre y apellido"
                  value={nombre}
                  onChange={(e) => validarNombre(e.target.value)}
                />
                {errores.nombre && (
                  <span className="error-msg">{errores.nombre}</span>
                )}
              </div>

              {/* Campo correo con botón para enviar código de verificación.
                  Se deshabilita una vez que el correo fue verificado exitosamente. */}
              <div className="campo">
                <label className="campo-label">Correo electrónico</label>
                <div className="correo-verify-wrap">
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    value={correoReg}
                    onChange={(e) => validarCorreo(e.target.value, "registro")}
                    disabled={correoVerificado} // No editable si ya fue verificado
                    className={correoVerificado ? "input-verified" : ""}
                  />
                  {/* Muestra badge "Verificado" o el botón de enviar código según estado */}
                  {correoVerificado ? (
                    <span className="verified-badge">✓ Verificado</span>
                  ) : (
                    <button
                      type="button"
                      className="btn-send-code"
                      onClick={handleEnviarCodigo}
                      disabled={enviandoCodigo}
                    >
                      {enviandoCodigo
                        ? "Enviando..."
                        : codigoEnviado
                          ? "Reenviar"
                          : "Enviar código"}
                    </button>
                  )}
                </div>
                {errores.correoReg && (
                  <span className="error-msg">{errores.correoReg}</span>
                )}
              </div>

              {/* Campo contraseña del registro */}
              <div className="campo">
                <label className="campo-label">Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={passReg}
                  onChange={(e) => validarPassReg(e.target.value)}
                />
                {errores.passReg && (
                  <span className="error-msg">{errores.passReg}</span>
                )}
              </div>

              {/* Campo de confirmación — compara con el campo anterior */}
              <div className="campo">
                <label className="campo-label">Confirmar contraseña</label>
                <input
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={passReg2}
                  onChange={(e) => validarPassReg2(e.target.value)}
                />
                {errores.passReg2 && (
                  <span className="error-msg">{errores.passReg2}</span>
                )}
              </div>

              {/* Checkbox de aceptación de términos — obligatorio para registrarse */}
              <div className="terminos">
                <input
                  type="checkbox"
                  checked={terminos}
                  onChange={(e) => setTerminos(e.target.checked)}
                />
                <p>
                  Acepto los <a href="/terminos">Términos y Condiciones</a> y la
                  <a href="/privacidad"> Política de Privacidad</a>.
                </p>
              </div>

              <button
                type="button"
                className="btn-principal"
                onClick={handleRegister}
              >
                Crear cuenta →
              </button>
              <p className="pie">
                ¿Ya tienes cuenta?{" "}
                <label className="pie-link" htmlFor="r-login">
                  Inicia sesión
                </label>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODAL: PUERTA DE ACCESO ADMIN
          Aparece cuando se detecta un admin. Pide la contraseña maestra
          antes de permitir el acceso al panel de administración.
          Tiene animación de entrada y de shake al fallar.
      ══════════════════════════════════════════ */}
      {modalAdmin && (
        <div
          className="modal-overlay"
          style={{ zIndex: 9999, backdropFilter: "blur(8px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()} // Evita cerrar el modal al hacer clic dentro
            style={{
              background: "linear-gradient(160deg, #0d0d1a 0%, #0a0a16 100%)",
              border: "1px solid rgba(239,68,68,0.35)",
              borderRadius: "20px",
              padding: "44px 40px 36px",
              maxWidth: "460px",
              width: "90%",
              boxShadow:
                "0 0 60px rgba(239,68,68,0.15), 0 24px 48px rgba(0,0,0,0.6)",
              // Alterna entre animación de entrada normal y animación de shake según el estado
              animation: adminShake
                ? "adminShake 0.45s ease"
                : "adminEntrada 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Barra decorativa roja en la parte superior del modal */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: "linear-gradient(90deg, #EF4444, #DC2626, #EF4444)",
              }}
            />

            <div
              style={{
                fontSize: "3.5rem",
                textAlign: "center",
                marginBottom: "16px",
                filter: "drop-shadow(0 0 16px rgba(239,68,68,0.5))",
              }}
            >
              ⚠️
            </div>

            <p
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "2rem",
                fontWeight: 800,
                color: "#e00a0ae9",
                textAlign: "center",
                margin: "0 0 10px",
                letterSpacing: "-0.02em",
              }}
            >
              Zona restringida
            </p>
            <br />

            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  fontSize: "0.83rem",
                  color: "rgba(255,255,255,0.7)",
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Estás intentando acceder a una{" "}
                <strong style={{ color: "#EF4444" }}>
                  cuenta de administrador
                </strong>
                . Para continuar, introduce la contraseña exclusiva de admins.
              </p>
            </div>

            {/* Input para la contraseña maestra — se deshabilita si fue bloqueado */}
            <input
              type="password"
              placeholder="Contraseña de administradores"
              value={adminMasterInput}
              onChange={(e) => setAdminMasterInput(e.target.value)}
              // Permite confirmar con Enter además del botón
              onKeyDown={(e) =>
                e.key === "Enter" && !adminBloqueado && handleAdminConfirmar()
              }
              disabled={adminBloqueado}
              style={{
                width: "100%",
                background: adminBloqueado
                  ? "rgba(239,68,68,0.05)"
                  : "rgba(255,255,255,0.06)",
                border: `1px solid ${adminError && !adminBloqueado ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: "10px",
                color: "#fff",
                padding: "13px 16px",
                fontSize: "0.9rem",
                outline: "none",
                marginBottom: "12px",
                boxSizing: "border-box",
                cursor: adminBloqueado ? "not-allowed" : "text",
                letterSpacing: adminMasterInput ? "0.15em" : "normal",
              }}
            />

            {/* Indicador visual de intentos: 3 puntos que se llenan de rojo con cada fallo */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background:
                      n <= adminIntentos ? "#EF4444" : "rgba(255,255,255,0.1)",
                    boxShadow:
                      n <= adminIntentos
                        ? "0 0 8px rgba(239,68,68,0.6)"
                        : "none",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>

            {/* Mensaje de error debajo de los puntos (visible solo si hay error) */}
            {adminError && (
              <p
                style={{
                  color: adminBloqueado ? "#F87171" : "#FCA5A5",
                  fontSize: "0.8rem",
                  textAlign: "center",
                  margin: "0 0 16px",
                  fontWeight: 600,
                }}
              >
                {adminError}
              </p>
            )}

            {/* Si no está bloqueado muestra el botón de confirmar, si está bloqueado muestra mensaje */}
            {!adminBloqueado ? (
              <button
                type="button"
                onClick={handleAdminConfirmar}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #EF4444, #DC2626)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                  padding: "13px",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginBottom: "10px",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 4px 20px rgba(239,68,68,0.3)",
                }}
              >
                Verificar y acceder al panel
              </button>
            ) : (
              <div
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: "10px",
                  padding: "12px",
                  textAlign: "center",
                  marginBottom: "10px",
                  fontSize: "0.82rem",
                  color: "#F87171",
                }}
              >
                🔒 Acceso bloqueado por intentos fallidos
              </div>
            )}

            {/* Botón para cancelar y salir del modal sin acceder */}
            <button
              type="button"
              onClick={cerrarModalAdmin}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                color: "rgba(255,255,255,0.45)",
                padding: "10px",
                fontSize: "0.82rem",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cancelar
            </button>
          </div>

          {/* Definición de las animaciones CSS del modal admin */}
          <style>{`
            @keyframes adminEntrada {
              from { opacity: 0; transform: scale(0.94) translateY(12px); }
              to   { opacity: 1; transform: scale(1)    translateY(0); }
            }
            @keyframes adminShake {
              0%,100% { transform: translateX(0); }
              20%      { transform: translateX(-8px); }
              40%      { transform: translateX(8px); }
              60%      { transform: translateX(-6px); }
              80%      { transform: translateX(6px); }
            }
          `}</style>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: OLVIDÉ MI CONTRASEÑA
          Renderiza un contenido diferente según el paso actual (resetPaso):
          - "correo" → formulario para ingresar el correo
          - "codigo" → formulario para ingresar el código recibido
          - "nueva"  → formulario para escribir la nueva contraseña
      ══════════════════════════════════════════ */}
      {resetPaso && (
        <div className="modal-overlay" onClick={cerrarModalReset}>
          {/* stopPropagation evita que el clic dentro del modal lo cierre */}
          <div className="modal-codigo" onClick={(e) => e.stopPropagation()}>

            {/* PASO 1: Ingresar correo para recibir el código */}
            {resetPaso === "correo" && (
              <>
                <div className="modal-codigo-icon">🔑</div>
                <h3>¿Olvidaste tu contraseña?</h3>
                <p>
                  Ingresa tu correo y te enviaremos un código de verificación
                </p>
                <input
                  type="email"
                  className="input-codigo"
                  style={{
                    letterSpacing: "normal",
                    fontSize: "0.9rem",
                    textAlign: "left",
                    padding: "12px 14px",
                  }}
                  placeholder="tu@correo.com"
                  value={resetCorreo}
                  onChange={(e) => setResetCorreo(e.target.value)}
                />
                <button
                  className="btn-principal"
                  onClick={handleResetEnviarCodigo}
                  disabled={resetCargando}
                >
                  {resetCargando
                    ? "Enviando..."
                    : "Enviar código de verificación"}
                </button>
                <button className="btn-cerrar-modal" onClick={cerrarModalReset}>
                  Cancelar
                </button>
              </>
            )}

            {/* PASO 2: Ingresar el código recibido por correo */}
            {resetPaso === "codigo" && (
              <>
                <div className="modal-codigo-icon">📧</div>
                <h3>Revisa tu correo</h3>
                <p>
                  Enviamos un código de 6 dígitos a{" "}
                  <strong>{resetCorreo}</strong>
                </p>
                {/* Solo acepta dígitos, reemplaza cualquier otro carácter */}
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="input-codigo"
                  value={resetCodigo}
                  onChange={(e) =>
                    setResetCodigo(e.target.value.replace(/\D/g, ""))
                  }
                />
                <button
                  className="btn-principal"
                  onClick={handleResetVerificarCodigo}
                  disabled={resetCargando}
                >
                  {resetCargando ? "Verificando..." : "Confirmar código"}
                </button>
                <button
                  className="btn-reenviar"
                  onClick={handleResetReenviarCodigo}
                  disabled={resetCargando}
                >
                  Reenviar código
                </button>
                <button className="btn-cerrar-modal" onClick={cerrarModalReset}>
                  Cancelar
                </button>
              </>
            )}

            {/* PASO 3: Escribir y confirmar la nueva contraseña */}
            {resetPaso === "nueva" && (
              <>
                <div className="modal-codigo-icon">🔒</div>
                <h3>Nueva contraseña</h3>
                <p>Elige una contraseña segura de mínimo 8 caracteres</p>
                <input
                  type="password"
                  className="input-codigo"
                  style={{
                    letterSpacing: "normal",
                    fontSize: "0.9rem",
                    textAlign: "left",
                    padding: "12px 14px",
                  }}
                  placeholder="Nueva contraseña"
                  value={resetPass}
                  onChange={(e) => setResetPass(e.target.value)}
                />
                <input
                  type="password"
                  className="input-codigo"
                  style={{
                    letterSpacing: "normal",
                    fontSize: "0.9rem",
                    textAlign: "left",
                    padding: "12px 14px",
                    marginTop: "10px",
                  }}
                  placeholder="Confirmar contraseña"
                  value={resetPass2}
                  onChange={(e) => setResetPass2(e.target.value)}
                />
                <button
                  className="btn-principal"
                  onClick={handleResetGuardar}
                  disabled={resetCargando}
                >
                  {resetCargando ? "Guardando..." : "Guardar contraseña"}
                </button>
                <button className="btn-cerrar-modal" onClick={cerrarModalReset}>
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: CÓDIGO DE VERIFICACIÓN (REGISTRO)
          Aparece después de enviar el código al correo durante el registro.
          Permite al usuario ingresar el código de 6 dígitos recibido.
      ══════════════════════════════════════════ */}
      {mostrarModalCodigo && (
        <div
          className="modal-overlay"
          onClick={() => setMostrarModalCodigo(false)}
        >
          <div className="modal-codigo" onClick={(e) => e.stopPropagation()}>
            <div className="modal-codigo-icon">📧</div>
            <h3>Revisa tu correo</h3>
            <p>
              Enviamos un código de 6 dígitos a <strong>{correoReg}</strong>
            </p>
            {/* Filtra para que solo se puedan ingresar números */}
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={codigoInput}
              onChange={(e) =>
                setCodigoInput(e.target.value.replace(/\D/g, ""))
              }
              className="input-codigo"
            />
            <button className="btn-principal" onClick={handleVerificarCodigo}>
              Confirmar código
            </button>
            <button className="btn-reenviar" onClick={handleEnviarCodigo}>
              Reenviar código
            </button>
            <button
              className="btn-cerrar-modal"
              onClick={() => setMostrarModalCodigo(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL GENÉRICO: NOTIFICACIONES
          Se usa para mostrar mensajes de éxito, error o información
          en cualquier parte del flujo. Se cierra al hacer clic fuera o en "Cerrar".
      ══════════════════════════════════════════ */}
      {modal.visible && (
        <div
          className="modal-overlay"
          onClick={() => setModal({ ...modal, visible: false })}
        >
          <div
            className={`modal-box ${modal.tipo}`} // La clase CSS cambia según el tipo (error/success/info)
            onClick={(e) => e.stopPropagation()}
          >
            <p>{modal.mensaje}</p>
            <button onClick={() => setModal({ ...modal, visible: false })}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}