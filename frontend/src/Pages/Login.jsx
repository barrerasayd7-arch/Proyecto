import { useState, useEffect } from "react";
import "../styles/StylePage/StyleLogin.css";
import { useNavigate } from "react-router-dom";
import logoIcon from '../img/logo_color_noBG.png';

export default function Login() {
  const navigate = useNavigate();

  // ===== STATES LOGIN =====
  const [correo, setCorreo] = useState("");
  const [pass, setPass]     = useState("");

  // ===== STATES REGISTRO =====
  const [nombre,    setNombre]    = useState("");
  const [correoReg, setCorreoReg] = useState("");
  const [passReg,   setPassReg]   = useState("");
  const [passReg2,  setPassReg2]  = useState("");
  const [terminos,  setTerminos]  = useState(false);

  // ===== ESTADOS VERIFICACIÓN REGISTRO =====
  const [codigoEnviado,      setCodigoEnviado]      = useState(false);
  const [codigoInput,        setCodigoInput]        = useState("");
  const [correoVerificado,   setCorreoVerificado]   = useState(false);
  const [enviandoCodigo,     setEnviandoCodigo]     = useState(false);
  const [mostrarModalCodigo, setMostrarModalCodigo] = useState(false);

  // ===== ESTADOS FLUJO "OLVIDÉ MI CONTRASEÑA" =====
  // Pasos: null → 'correo' → 'codigo' → 'nueva'
  const [resetPaso,          setResetPaso]          = useState(null);
  const [resetCorreo,        setResetCorreo]        = useState("");
  const [resetCodigo,        setResetCodigo]        = useState("");
  const [resetPass,          setResetPass]          = useState("");
  const [resetPass2,         setResetPass2]         = useState("");
  const [resetCargando,      setResetCargando]      = useState(false);

  const [errores, setErrores] = useState({});
  const [modal,   setModal]   = useState({ visible: false, mensaje: "", tipo: "error" });

  // Helper para mostrar notificación
  const notificar = (mensaje, tipo = "error") =>
    setModal({ visible: true, mensaje, tipo });

  // ════════════════════════════════
  // VALIDACIONES EN TIEMPO REAL
  // ════════════════════════════════

  const validarCorreo = (email, tipo = "login") => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const esValido = regex.test(email);
    if (tipo === "login") {
      setCorreo(email);
      setErrores(prev => ({ ...prev, correo: esValido ? "" : "Correo inválido" }));
    } else {
      setCorreoReg(email);
      setErrores(prev => ({ ...prev, correoReg: esValido ? "" : "Correo inválido" }));
    }
  };

  const validarPassLogin = (value) => {
    setPass(value);
    setErrores(prev => ({ ...prev, pass: value.length < 8 ? "Mínimo 8 caracteres" : "" }));
  };

  const validarNombre = (value) => {
    setNombre(value);
    if (value.trim().length < 3)
      setErrores(prev => ({ ...prev, nombre: "Mínimo 3 caracteres" }));
    else if (value.length > 50)
      setErrores(prev => ({ ...prev, nombre: "Nombre muy largo" }));
    else
      setErrores(prev => ({ ...prev, nombre: "" }));
  };

  const validarPassReg = (value) => {
    setPassReg(value);
    setErrores(prev => ({
      ...prev,
      passReg: value.length < 8 ? "Mínimo 8 caracteres" : "",
      ...(passReg2 && { passReg2: value !== passReg2 ? "Las contraseñas no coinciden" : "" }),
    }));
  };

  const validarPassReg2 = (value) => {
    setPassReg2(value);
    if (value.length < 8)
      setErrores(prev => ({ ...prev, passReg2: "Mínimo 8 caracteres" }));
    else if (value !== passReg)
      setErrores(prev => ({ ...prev, passReg2: "Las contraseñas no coinciden" }));
    else
      setErrores(prev => ({ ...prev, passReg2: "" }));
  };

  // ════════════════════════════════
  // VERIFICACIÓN CORREO (REGISTRO)
  // ════════════════════════════════

  const handleEnviarCodigo = async () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoReg || !regex.test(correoReg)) {
      notificar("❌ Ingresa un correo válido primero");
      return;
    }
    setEnviandoCodigo(true);
    try {
      const res = await fetch("https://localhost:7237/api/Auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoReg }),
      });
      if (res.ok) {
        setCodigoEnviado(true);
        setMostrarModalCodigo(true);
      } else {
        notificar("❌ Error al enviar el código");
      }
    } catch {
      notificar("❌ Error de conexión");
    } finally {
      setEnviandoCodigo(false);
    }
  };

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
        setCorreoVerificado(true);
        setMostrarModalCodigo(false);
        notificar("✅ Correo verificado con éxito", "success");
      } else {
        notificar("❌ Código incorrecto, intenta de nuevo");
      }
    } catch {
      notificar("❌ Error en la verificación");
    }
  };

  // ════════════════════════════════
  // FLUJO OLVIDÉ MI CONTRASEÑA
  // Paso 1: pide correo y envía código
  // Paso 2: verifica el código
  // Paso 3: pide nueva contraseña
  // ════════════════════════════════

  // PASO 1 — Enviar código al correo ingresado
  const handleResetEnviarCodigo = async () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!resetCorreo || !regex.test(resetCorreo)) {
      notificar("❌ Ingresa un correo válido");
      return;
    }
    setResetCargando(true);
    try {
      const res = await fetch("https://localhost:7237/api/Auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: resetCorreo }),
      });
      if (res.ok) {
        setResetPaso("codigo"); // avanza al paso 2
      } else {
        notificar("❌ Error al enviar el código");
      }
    } catch {
      notificar("❌ Error de conexión");
    } finally {
      setResetCargando(false);
    }
  };

  // PASO 2 — Reenviar código sin avanzar de paso
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

  // PASO 2 — Verificar código ingresado
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
        setResetPaso("nueva"); // avanza al paso 3
      } else {
        notificar("❌ Código incorrecto o expirado");
      }
    } catch {
      notificar("❌ Error de conexión");
    } finally {
      setResetCargando(false);
    }
  };

  // PASO 3 — Guardar nueva contraseña
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
      const res = await fetch("https://localhost:7237/api/Auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo:        resetCorreo,
          codigo:        resetCodigo,
          nuevaPassword: resetPass,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        notificar("✅ Contraseña cambiada correctamente. Ya puedes iniciar sesión.", "success");
        // Limpia y cierra el modal
        setResetPaso(null);
        setResetCorreo(""); setResetCodigo("");
        setResetPass(""); setResetPass2("");
      } else {
        notificar("❌ " + (data.error || "Error al cambiar contraseña"));
      }
    } catch {
      notificar("❌ Error de conexión");
    } finally {
      setResetCargando(false);
    }
  };

  // Cierra y resetea el modal de olvidé contraseña
  const cerrarModalReset = () => {
    setResetPaso(null);
    setResetCorreo(""); setResetCodigo("");
    setResetPass(""); setResetPass2("");
  };

  // ════════════════════════════════
  // LOGIN
  // ════════════════════════════════

  const handleLogin = async () => {
    if (!correo || errores.correo) { notificar("❌ Ingresa un correo válido"); return; }
    if (pass.length < 8) { notificar("❌ La contraseña debe tener mínimo 8 caracteres"); return; }

    try {
      const res = await fetch("https://localhost:7237/api/Users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password: pass }),
      });
      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token",        data.token);
        localStorage.setItem("usuarioId",    data.user.id_usuario);
        localStorage.setItem("usuario",      data.user.nombre);
        localStorage.setItem("usuarioCorreo",data.user.correo);
        localStorage.setItem("logueado",     "true");

        // Marcar como conectado en la base
        try {
          await fetch(`https://localhost:7237/api/Users/${data.user.id_usuario}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${data.token}`
            },
            body: JSON.stringify({ estado: 1 })
          });
        } catch (e) {
          console.error("Error silencioso al cambiar estado:", e);
        }

        notificar("✅ Bienvenido " + data.user.nombre, "success");
        setTimeout(() => navigate("/home", { replace: true }), 1500);
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuarioId", data.user.id);
        localStorage.setItem("usuario", data.user.nombre);
      } else {
        notificar("❌ " + (data.message || "Credenciales incorrectas"));
      }
    } catch {
      notificar("❌ Error de conexión");
    }
  };

  // ════════════════════════════════
  // REGISTRO
  // ════════════════════════════════

  const handleRegister = async () => {
    if (!correoVerificado) { notificar("❌ Debes verificar tu correo primero"); return; }
    if (passReg.length < 8 || passReg !== passReg2 || nombre.trim().length < 3 || !terminos) {
      notificar("❌ Revisa los campos del formulario"); return;
    }
    try {
      const res = await fetch("https://localhost:7237/api/Users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoReg, password: passReg, nombre: nombre.trim(), codigo: codigoInput }),
      });
      const data = await res.json();
      if (data.error) {
        notificar("❌ " + data.error);
      } else {
        notificar("✅ Cuenta creada, ya puedes iniciar sesión", "success");
        setNombre(""); setCorreoReg(""); setPassReg(""); setPassReg2("");
        setTerminos(false); setErrores({});
        setCorreoVerificado(false); setCodigoEnviado(false); setCodigoInput("");
      }
    } catch {
      notificar("❌ Error de conexión");
    }
  };

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  // ════════════════════════════════
  // JSX
  // ════════════════════════════════
  return (
    <>
      <input type="radio" className="tab-radio" name="tab" id="r-login" defaultChecked />
      <input type="radio" className="tab-radio" name="tab" id="r-reg" />

      <div className="auth-wrapper">
        <div className="auth-box">

          {/* COLUMNA IZQUIERDA — decorativa */}
          <div className="auth-lateral">
            <div className="lateral-contenido">
              <div className="lateral-icono">
                <img src={logoIcon} alt="UniServices Logo" style={{ width: '100%', height: 'auto' }} />
              </div>
              <h2>Uni<span style={{ color: '#0ea5a0', fontWeight: 'bold' }}>Service</span></h2>
              <p className="lateral-desc">
                Intercambia tutorías, proyectos, diseño y más con otros estudiantes universitarios.
              </p>
              <div className="lateral-chips">
                {["📚 Tutorías","💻 Programación","✍️ Ensayos","🎨 Diseño","⚡ Productos","🏠 Arriendo"]
                  .map(c => <span key={c} className="lateral-chip">{c}</span>)}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA — formularios */}
          <div className="auth-formulario">
            <div className="auth-logo">
              <p className="auth-pretitle">Bienvenido 👋</p>
              <h1 className="auth-title">Accede a la <span>plataforma</span></h1>
              <p className="auth-subtitle">
                Convierte tu conocimiento en oportunidades y encuentra ayuda cuando la necesites.
              </p>
            </div>

            <div className="tabs">
              <label className="tab" htmlFor="r-login">Iniciar sesión</label>
              <label className="tab" htmlFor="r-reg">Registrarse</label>
            </div>

            {/* ── PANEL LOGIN ── */}
            <div className="form-panel" id="panel-login">
              <div className="campo">
                <label className="campo-label">Correo electrónico</label>
                <input type="email" placeholder="tu@correo.com"
                  value={correo} onChange={(e) => validarCorreo(e.target.value, "login")} />
                {errores.correo && <span className="error-msg">{errores.correo}</span>}
              </div>

              <div className="campo">
                <label className="campo-label">Contraseña</label>
                <input type="password" placeholder="Tu contraseña"
                  value={pass} onChange={(e) => validarPassLogin(e.target.value)} />
                {errores.pass && <span className="error-msg">{errores.pass}</span>}
              </div>

              {/* Enlace que abre el modal de recuperación */}
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
                <button className="btn-principal" type="button" onClick={handleLogin}>
                  Entrar →
                </button>
                <button className="btn-secundario" onClick={() => navigate("/home-guest")}>
                  Entrar como invitado
                </button>
              </div>

              <p className="pie">¿No tienes cuenta? <label className="pie-link" htmlFor="r-reg">Regístrate gratis</label></p>
            </div>

            {/* ── PANEL REGISTRO ── */}
            <div className="form-panel" id="panel-reg">
              <div className="campo">
                <label className="campo-label">Nombre completo</label>
                <input type="text" placeholder="Tu nombre y apellido"
                  value={nombre} onChange={(e) => validarNombre(e.target.value)} />
                {errores.nombre && <span className="error-msg">{errores.nombre}</span>}
              </div>

              {/* Correo + botón enviar código */}
              <div className="campo">
                <label className="campo-label">Correo electrónico</label>
                <div className="correo-verify-wrap">
                  <input type="email" placeholder="tu@correo.com"
                    value={correoReg}
                    onChange={(e) => validarCorreo(e.target.value, "registro")}
                    disabled={correoVerificado}
                    className={correoVerificado ? "input-verified" : ""}
                  />
                  {correoVerificado ? (
                    <span className="verified-badge">✓ Verificado</span>
                  ) : (
                    <button type="button" className="btn-send-code"
                      onClick={handleEnviarCodigo} disabled={enviandoCodigo}>
                      {enviandoCodigo ? "Enviando..." : codigoEnviado ? "Reenviar" : "Enviar código"}
                    </button>
                  )}
                </div>
                {errores.correoReg && <span className="error-msg">{errores.correoReg}</span>}
              </div>

              <div className="campo">
                <label className="campo-label">Contraseña</label>
                <input type="password" placeholder="Mínimo 8 caracteres"
                  value={passReg} onChange={(e) => validarPassReg(e.target.value)} />
                {errores.passReg && <span className="error-msg">{errores.passReg}</span>}
              </div>

              <div className="campo">
                <label className="campo-label">Confirmar contraseña</label>
                <input type="password" placeholder="Repite tu contraseña"
                  value={passReg2} onChange={(e) => validarPassReg2(e.target.value)} />
                {errores.passReg2 && <span className="error-msg">{errores.passReg2}</span>}
              </div>

              <div className="terminos">
                <input type="checkbox" checked={terminos} onChange={(e) => setTerminos(e.target.checked)} />
                <p>
                  Acepto los <a href="/terminos">Términos y Condiciones</a> y la
                  <a href="/privacidad"> Política de Privacidad</a>.
                </p>
              </div>

              <button type="button" className="btn-principal" onClick={handleRegister}>
                Crear cuenta →
              </button>
              <p className="pie">¿Ya tienes cuenta? <label className="pie-link" htmlFor="r-login">Inicia sesión</label></p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODAL: OLVIDÉ MI CONTRASEÑA
          Flujo de 3 pasos controlado por resetPaso:
          'correo' → 'codigo' → 'nueva'
      ══════════════════════════════════════════ */}
      {resetPaso && (
        <div className="modal-overlay" onClick={cerrarModalReset}>
          <div className="modal-codigo" onClick={(e) => e.stopPropagation()}>

            {/* PASO 1 — Ingresar correo */}
            {resetPaso === "correo" && (
              <>
                <div className="modal-codigo-icon">🔑</div>
                <h3>¿Olvidaste tu contraseña?</h3>
                <p>Ingresa tu correo y te enviaremos un código de verificación</p>
                <input
                  type="email"
                  className="input-codigo"
                  style={{ letterSpacing: "normal", fontSize: "0.9rem", textAlign: "left", padding: "12px 14px" }}
                  placeholder="tu@correo.com"
                  value={resetCorreo}
                  onChange={(e) => setResetCorreo(e.target.value)}
                />
                <button className="btn-principal" onClick={handleResetEnviarCodigo} disabled={resetCargando}>
                  {resetCargando ? "Enviando..." : "Enviar código de verificación"}
                </button>
                <button className="btn-cerrar-modal" onClick={cerrarModalReset}>Cancelar</button>
              </>
            )}

            {/* PASO 2 — Ingresar código recibido por correo */}
            {resetPaso === "codigo" && (
              <>
                <div className="modal-codigo-icon">📧</div>
                <h3>Revisa tu correo</h3>
                <p>Enviamos un código de 6 dígitos a <strong>{resetCorreo}</strong></p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="input-codigo"
                  value={resetCodigo}
                  onChange={(e) => setResetCodigo(e.target.value.replace(/\D/g, ""))}
                />
                <button className="btn-principal" onClick={handleResetVerificarCodigo} disabled={resetCargando}>
                  {resetCargando ? "Verificando..." : "Confirmar código"}
                </button>
                <button className="btn-reenviar" onClick={handleResetReenviarCodigo} disabled={resetCargando}>
                  Reenviar código
                </button>
                <button className="btn-cerrar-modal" onClick={cerrarModalReset}>Cancelar</button>
              </>
            )}

            {/* PASO 3 — Nueva contraseña */}
            {resetPaso === "nueva" && (
              <>
                <div className="modal-codigo-icon">🔒</div>
                <h3>Nueva contraseña</h3>
                <p>Elige una contraseña segura de mínimo 8 caracteres</p>
                <input
                  type="password"
                  className="input-codigo"
                  style={{ letterSpacing: "normal", fontSize: "0.9rem", textAlign: "left", padding: "12px 14px" }}
                  placeholder="Nueva contraseña"
                  value={resetPass}
                  onChange={(e) => setResetPass(e.target.value)}
                />
                <input
                  type="password"
                  className="input-codigo"
                  style={{ letterSpacing: "normal", fontSize: "0.9rem", textAlign: "left",
                           padding: "12px 14px", marginTop: "10px" }}
                  placeholder="Confirmar contraseña"
                  value={resetPass2}
                  onChange={(e) => setResetPass2(e.target.value)}
                />
                <button className="btn-principal" onClick={handleResetGuardar} disabled={resetCargando}>
                  {resetCargando ? "Guardando..." : "Guardar contraseña"}
                </button>
                <button className="btn-cerrar-modal" onClick={cerrarModalReset}>Cancelar</button>
              </>
            )}

          </div>
        </div>
      )}

      {/* MODAL: Código de verificación de REGISTRO */}
      {mostrarModalCodigo && (
        <div className="modal-overlay" onClick={() => setMostrarModalCodigo(false)}>
          <div className="modal-codigo" onClick={(e) => e.stopPropagation()}>
            <div className="modal-codigo-icon">📧</div>
            <h3>Revisa tu correo</h3>
            <p>Enviamos un código de 6 dígitos a <strong>{correoReg}</strong></p>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value.replace(/\D/g, ""))}
              className="input-codigo"
            />
            <button className="btn-principal" onClick={handleVerificarCodigo}>
              Confirmar código
            </button>
            <button className="btn-reenviar" onClick={handleEnviarCodigo}>
              Reenviar código
            </button>
            <button className="btn-cerrar-modal" onClick={() => setMostrarModalCodigo(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Notificaciones de éxito / error */}
      {modal.visible && (
        <div className="modal-overlay" onClick={() => setModal({ ...modal, visible: false })}>
          <div className={`modal-box ${modal.tipo}`} onClick={(e) => e.stopPropagation()}>
            <p>{modal.mensaje}</p>
            <button onClick={() => setModal({ ...modal, visible: false })}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}