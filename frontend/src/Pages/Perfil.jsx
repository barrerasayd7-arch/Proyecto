import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../Components/Navbar_Perfil";
import "../styles/styleHome.css";
import "../styles/stylePerfil.css";

// URL base del API de usuarios
const API_USUARIO = "http://localhost:5165/api/users";

const Perfil = () => {
  const navigate = useNavigate();
  // useRef para referenciar el input de archivo sin re-renderizar el componente
  const FileInputRef = useRef(null);

  // useParams permite leer el :id de la URL, por ejemplo /perfil/12
  // Si no hay id en la URL, el usuario está viendo su propio perfil
  const { id: idUrl } = useParams();

  // ID del usuario que inició sesión (guardado en localStorage al hacer login)
  const id_usuario_logueado = localStorage.getItem("usuarioId");

  // Si la URL trae un ID distinto al del usuario logueado, es un perfil ajeno
  const esPerfilExterno = idUrl && idUrl !== id_usuario_logueado;

  // Dependiendo de si es externo o propio, consultamos un ID diferente
  const id_a_consultar = esPerfilExterno ? idUrl : id_usuario_logueado;

  // Estado para saber si el usuario logueado ya sigue al dueño del perfil externo
  const [siguiendo, setSiguiendo] = useState(false);

  // Estado principal con todos los datos del perfil a mostrar
  // Se inicializa con valores por defecto mientras llega la respuesta del API
  const [userData, setUserData] = useState({
    nombre: "Cargando...",
    avatar: "../src/img/default-avatar.png",
    descripcion: "Cargando información...",
    telefono: "No disponible",
    correo: "usuario@ejemplo.com",
    fecha_registro: "2024-01-01",
    estado: 0, // 0 = desconectado por defecto mientras carga
    total_publicaciones: 0,
    total_seguidores: 0,
    total_siguiendo: 0,
    reputacion: null, // null hasta que llegue el dato real
    universidad: "Sin universidad",
  });

  // Evita que el usuario haga clic en "Seguir" varias veces seguidas
  const [enviandoSeguimiento, setEnviandoSeguimiento] = useState(false);

  // Controla qué modal está visible: "info", "imagen", "actividad" o null (ninguno)
  const [activeModal, setActiveModal] = useState(null);

  const [misServicios, setMisServicios] = useState([]);
  // Almacena el servicio que se está editando (con todos sus campos)
  const [editando, setEditando] = useState(null);
  // Guarda el ID del servicio que se quiere eliminar, para mostrar confirmación
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  // ════════════════════════════════════════════════════════════
  // SABER SI YA SEGUIMOS A ESTE USUARIO (solo en perfil externo)
  // ════════════════════════════════════════════════════════════

  useEffect(() => {
    if (esPerfilExterno && id_usuario_logueado && id_a_consultar) {
      fetch(
        `${API_USUARIO}/es-seguidor?seguidor=${id_usuario_logueado}&seguido=${id_a_consultar}`,
      )
        .then((res) => res.json())
        .then((data) => setSiguiendo(data.esSeguidor))
        .catch((err) => console.error("Error al verificar seguimiento:", err));
    }
  }, [id_a_consultar, esPerfilExterno, id_usuario_logueado]);

  // ════════════════════════
  // CARGAR DATOS DEL USUARIO
  // ════════════════════════
  useEffect(() => {
    // Guardamos para no hacer fetch con un ID inválido
    if (!id_a_consultar || id_a_consultar === "undefined") {
      console.warn("No hay ID guardado. Debes iniciar sesión.");
      return;
    }

    // GET al endpoint de usuarios con el token JWT en el header para autenticar
    fetch(`http://localhost:5165/api/users/${id_a_consultar}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          // Normalizamos el estado a boolean, ya que puede llegar como 0/1, true/false o string
          const estadoNormalizado = !!(
            data.estado === true ||
            data.estado === 1 ||
            data.estado === "1"
          );

          setUserData({
            ...data,
            estado: estadoNormalizado,
          });
        }
      })
      .catch((err) => console.error("Error al cargar perfil:", err));

    // Permitimos cerrar cualquier modal con la tecla Escape
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveModal(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    // Limpiamos el evento al desmontar el componente para evitar memory leaks
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [id_a_consultar]);

  // ═════════════════════════════════
  // CARGAR DATOS DE SERVICIOS PROPIOS
  // ═════════════════════════════════
  useEffect(() => {
    // Los servicios solo se cargan si es el perfil propio
    if (esPerfilExterno || !id_a_consultar || id_a_consultar === "undefined")
      return;

    // Traemos todos los servicios y filtramos los que le pertenecen al usuario
    fetch(`http://localhost:5165/api/services`)
      .then((r) => r.json())
      .then((data) =>
        setMisServicios(
          data.filter((s) => s.id_proveedor === parseInt(id_a_consultar)),
        ),
      )
      .catch(console.error);
  }, [id_a_consultar, esPerfilExterno]);

  // ════════════════════════════════════════════════════════
  // ACTUALIZAR INFO EN LA BASE DE DATOS (solo perfil propio)
  // ════════════════════════════════════════════════════════
  // Función genérica: recibe el nombre del campo y el nuevo valor
  // Esto permite reusar la misma función para nombre, descripción, teléfono, etc.
  const handleUpdate = async (campo, valor) => {
    try {
      const res = await fetch(`/api/users/${id_usuario_logueado}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ [campo]: valor }), // Enviamos solo el campo que cambió
      });
      const result = await res.json();
      if (result.ok) {
        // Actualizamos el estado local sin necesidad de recargar la página
        setUserData((prev) => ({ ...prev, [campo]: valor }));
        setActiveModal(null);
      }
    } catch {
      alert("Error al actualizar");
    }
  };

  // ═════════════
  // CERRAR SESIÓN
  // ═════════════
  const handleCerrarSesion = async () => {
    try {
      // Antes de salir, marcamos al usuario como desconectado en la BD
      await fetch(`/api/users/${id_usuario_logueado}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ estado: 0 }), // 0 = desconectado
      });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      // Siempre limpiamos el localStorage y redirigimos, aunque falle el PUT
      localStorage.clear();
      navigate("/home-guest");
    }
  };

  // Prepara y envía los datos del servicio editado al backend
  const guardarEdicion = async (s) => {
    const body = {
      id_proveedor: parseInt(id_usuario_logueado),
      titulo: s.titulo || "",
      descripcion: s.descripcion || "",
      precio_hora: Number(s.precio_hora) || 0,
      contacto: s.contacto || "",
      icono: s.icono || "📌",
    };

    const res = await fetch(
      `http://localhost:5165/api/services/${s.id_servicio}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (res.ok) {
      // Actualizamos solo el servicio modificado en el estado local (sin recargar toda la lista)
      setMisServicios((prev) =>
        prev.map((x) =>
          x.id_servicio === s.id_servicio ? { ...x, ...body } : x,
        ),
      );
      setEditando(null);
    } else {
      const err = await res.json();
      alert("Error: " + (err.error || "No se pudo guardar"));
    }
  };

  // Llama al endpoint DELETE y elimina el servicio de la lista local si el servidor responde OK
  const confirmarEliminar = async () => {
    const res = await fetch(
      `http://localhost:5165/api/services/${confirmEliminar}?id_proveedor=${id_usuario_logueado}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (res.ok) {
      // Filtramos el servicio eliminado del estado para que desaparezca de la UI
      setMisServicios((prev) =>
        prev.filter((s) => s.id_servicio !== confirmEliminar),
      );
      setConfirmEliminar(null);
    } else {
      alert("Error al eliminar el servicio.");
    }
  };

  // ════════════════════════════════
  // COMPARTIR PERFIL
  // ════════════════════════════════
  const handleShare = async () => {
    try {
      // Usamos la Web Share API si el navegador la soporta (principalmente móvil)
      if (navigator.share) {
        await navigator.share({
          title: "UniServices - Perfil de " + userData.nombre,
          url: window.location.href,
        });
      } else {
        // Fallback: copiar el enlace al portapapeles en navegadores de escritorio
        await navigator.clipboard.writeText(window.location.href);
        alert("¡Enlace copiado al portapapeles!");
      }
    } catch (err) {
      console.error("Error al compartir:", err);
    }
  };

  // ════════════════════════════════
  // SUBIR IMAGEN LOCAL
  // ════════════════════════════════
  const handleSubirImagenLocal = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // FormData permite enviar archivos binarios al servidor (multipart/form-data)
    const formData = new FormData();
    formData.append("file", file); // Debe coincidir con el nombre del parámetro IFormFile en C#
    formData.append("id_usuario", id_usuario_logueado);

    try {
      const response = await fetch(
        "http://localhost:5165/api/usuarios/upload-avatar",
        {
          method: "POST",
          headers: {
            // No incluyas Content-Type, el navegador lo pondrá automáticamente con el boundary correcto
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );

      const result = await response.json();

      if (response.ok && result.ok) {
        // Actualizamos el avatar en el estado sin recargar la página
        setUserData((prev) => ({ ...prev, avatar: result.avatarUrl }));
        setActiveModal(null);
      } else {
        alert("❌ Error al subir: " + (result.error || "Error en el servidor"));
      }
    } catch (err) {
      console.error("Error en subida:", err);
      alert("❌ Error de conexión con el servidor de C#");
    }
  };

  // Convierte una fecha ISO en texto legible: "mayo 2024"
  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha desconocida";
    return new Date(fecha).toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  // Abrevia números grandes para que no rompan el diseño: 1200 → "1.2k"
  const formatearNumero = (num) => {
    if (!num) return 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num;
  };

  // Boolean que indica si el usuario está activo/disponible según la BD
  const estaConectado = userData.estado;

  // Si no hay calificaciones, mostramos un texto en lugar de "0/5.0"
  const reputacionTexto =
    userData.reputacion && userData.reputacion !== "N/A"
      ? parseFloat(userData.reputacion).toFixed(1) + "/5.0"
      : "Sin calificaciones";

  // Maneja la lógica de seguir/dejar de seguir
  // Usa el flag enviandoSeguimiento para bloquear el botón mientras espera respuesta
  const toggleSeguir = async () => {
    if (enviandoSeguimiento) return;
    setEnviandoSeguimiento(true);

    try {
      const accionActual = siguiendo;
      // Si ya seguimos → DELETE "dejar-seguir"; si no → POST "seguir"
      const endpoint = accionActual ? "dejar-seguir" : "seguir";
      const metodo = accionActual ? "DELETE" : "POST";

      const response = await fetch(`${API_USUARIO}/${endpoint}`, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          id_seguidor: parseInt(id_usuario_logueado),
          id_seguido: parseInt(id_a_consultar),
        }),
      });

      if (response.ok) {
        setSiguiendo(!accionActual);
        // Actualizamos el contador de seguidores localmente para respuesta inmediata
        setUserData((prev) => ({
          ...prev,
          total_seguidores: accionActual
            ? Math.max(0, prev.total_seguidores - 1)
            : (prev.total_seguidores || 0) + 1,
        }));
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        alert(
          "Error: " +
            (errorData.message || "No se pudo actualizar el seguimiento"),
        );
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de conexión al procesar el seguimiento");
    } finally {
      // Siempre liberamos el botón, haya salido bien o mal
      setEnviandoSeguimiento(false);
    }
  };

  // ════════════════════════════════
  // JSX
  // ════════════════════════════════

  return (
    <>
      <Navbar onCerrarSesion={handleCerrarSesion} />

      <div className="profile-page-wrapper">
        <div className="dynamic-bg">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>

        <main className="main-container">
          <div className="profile-wrapper">
            {/* ══ TARJETA IZQUIERDA ══ */}
            <div className="profile-card">
              <div className="profile-header">
                {/* Avatar — solo es clickeable para cambiar si es el perfil propio */}
                <div
                  className="avatar-wrapper"
                  onClick={() => !esPerfilExterno && setActiveModal("imagen")}
                  style={{ cursor: esPerfilExterno ? "default" : "pointer" }}
                >
                  <div className="avatar-ring"></div>
                  <img src={userData.avatar} alt="Avatar" className="avatar" />
                  {/* Indicador de estado online/offline según el campo "estado" de la BD */}
                  <div
                    className={`status-badge ${estaConectado ? "online" : "busy"}`}
                  ></div>
                </div>
                <h1 className="profile-name">{userData.nombre}</h1>
                <p className="profile-username">
                  @
                  {userData.nombre?.toLowerCase().replace(/\s/g, "") ||
                    "usuario"}
                </p>
              </div>

              <div className="profile-body">
                <p className="profile-bio">{userData.descripcion}</p>

                <div className="stats-grid">
                  <StatItem
                    value={userData.total_publicaciones}
                    label="Publicaciones"
                  />
                  <StatItem
                    value={formatearNumero(userData.total_seguidores)}
                    label="Seguidores"
                  />
                  <StatItem
                    value={userData.total_siguiendo}
                    label="Siguiendo"
                  />
                </div>

                <div className="action-buttons">
                  {esPerfilExterno ? (
                    // Perfil ajeno: se muestran Seguir y Compartir
                    <>
                      <button
                        className={`btn-seguir ${siguiendo ? "btn-siguiendo" : ""}`}
                        onClick={toggleSeguir}
                        disabled={enviandoSeguimiento}
                      >
                        {siguiendo ? "✓ Siguiendo" : "➕ Seguir"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleShare}
                      >
                        🔗 Compartir
                      </button>
                    </>
                  ) : (
                    // Perfil propio: se muestran Editar y Compartir
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => setActiveModal("info")}
                      >
                        ✏️ Editar Perfil
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleShare}
                      >
                        🔗 Compartir
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ══ PANEL DERECHO ══ */}
            <div className="right-panel">
              {/* El estado verde/rojo refleja el campo "estado" real de la BD */}
              <section className="menu-section">
                <div className="section-title">📊 Estado y Actividad</div>
                <div className="menu-list">
                  <div className="menu-item" style={{ cursor: "default" }}>
                    <div className="menu-icon">
                      {estaConectado ? "🟢" : "🔴"}
                    </div>
                    <div className="menu-text">
                      <div className="menu-title">Estado actual</div>
                      <div className="menu-desc">
                        {estaConectado ? "Disponible" : "No disponible"}
                      </div>
                    </div>
                    <span
                      className={`status-tag ${estaConectado ? "online" : "busy"}`}
                    >
                      {estaConectado ? "Conectado" : "Desconectado"}
                    </span>
                  </div>

                  {/* La sección de actividad solo es visible para el dueño del perfil */}
                  {!esPerfilExterno && (
                    <div
                      className="menu-item"
                      onClick={() => setActiveModal("actividad")}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="menu-icon">📈</div>
                      <div className="menu-text">
                        <div className="menu-title">Mi Actividad</div>
                        <div className="menu-desc">Revisa tus estadísticas</div>
                      </div>
                      <span className="menu-arrow">→</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Información del perfil */}
              <section className="menu-section">
                <div className="section-title">📋 Información</div>
                <div className="info-grid">
                  <InfoItem label="📧 Correo" value={userData.correo} />
                  <InfoItem
                    label="📅 Miembro desde"
                    value={formatearFecha(userData.fecha_registro)}
                  />
                  <InfoItem
                    label="🏫 Universidad"
                    value={userData.universidad || "Sin universidad"}
                  />
                  {/* La reputación se calcula en el backend promediando las calificaciones recibidas */}
                  <InfoItem label="⭐ Reputación" value={reputacionTexto} />
                  <InfoItem
                    label="📱 Teléfono"
                    value={userData.telefono || "No disponible"}
                  />
                  {/* Acceso rápido a secciones de seguridad, solo visible para el usuario propio */}
                  {!esPerfilExterno && (
                    <div className="menu-list">
                      <MenuItem
                        icon="🔒"
                        title="Seguridad"
                        desc="Gestiona tu cuenta"
                        onClick={() => navigate("/home#mis-servicios")}
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* ══ MIS SERVICIOS — Solo visible en el perfil propio ══ */}
              {!esPerfilExterno && (
                <section className="menu-section">
                  <div className="section-title">
                    📦 Mis servicios ({misServicios.length})
                  </div>

                  {misServicios.length === 0 ? (
                    <p
                      style={{
                        opacity: 0.5,
                        fontSize: "0.85rem",
                        padding: "12px 0",
                      }}
                    >
                      Aún no has publicado ningún servicio.
                    </p>
                  ) : (
                    <div className="menu-list">
                      {misServicios.map((s) => (
                        <div
                          key={s.id_servicio}
                          className="menu-item"
                          style={{
                            cursor: "default",
                            display: "flex",
                            alignItems: "center",
                            padding: "10px",
                          }}
                        >
                          <div className="menu-icon">{s.icono || "📌"}</div>
                          <div
                            className="menu-text"
                            style={{ flex: 1, minWidth: 0, marginLeft: "10px" }}
                          >
                            <div
                              className="menu-title"
                              style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontWeight: "bold",
                              }}
                            >
                              {s.titulo}
                            </div>
                            <div
                              className="menu-desc"
                              style={{ fontSize: "0.85rem", opacity: 0.8 }}
                            >
                              ${s.precio_hora}/hr ·{" "}
                              {s.nombre_categoria || "Sin categoría"}
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexShrink: 0,
                              alignItems: "center",
                            }}
                          >
                            {/* Botón editar: carga el servicio en el estado "editando" */}
                            <button
                              className="btn btn-primary"
                              style={{
                                width: "36px",
                                height: "36px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.85rem",
                                padding: 0,
                                margin: 0,
                                lineHeight: 1,
                              }}
                              onClick={() => setEditando({ ...s })}
                            >
                              ✏️
                            </button>
                            {/* Botón eliminar: guarda el ID y abre el modal de confirmación */}
                            <button
                              className="btn btn-primary"
                              style={{
                                width: "36px",
                                height: "36px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.85rem",
                                padding: 0,
                                margin: 0,
                                lineHeight: 1,
                                background: "transparent",
                                borderColor: "rgba(177, 52, 52, 0.4)",
                                color: "#f87171",
                              }}
                              onClick={() => setConfirmEliminar(s.id_servicio)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ══ MODAL: Confirmar eliminar ══ 
                  Aparece solo cuando confirmEliminar tiene un ID guardado
                  Clic fuera del modal lo cierra sin eliminar nada */}
              {confirmEliminar && (
                <div
                  className="image-menu-overlay active"
                  onClick={() => setConfirmEliminar(null)}
                >
                  <div
                    className="image-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="image-menu-title">🗑️ Eliminar servicio</h3>
                    <p
                      style={{
                        opacity: 0.7,
                        fontSize: "0.88rem",
                        margin: "0 0 20px",
                      }}
                    >
                      ¿Estás seguro? Esto eliminará también todas las
                      solicitudes asociadas y no se puede deshacer.
                    </p>
                    <div className="image-menu-options">
                      <button
                        className="image-option"
                        onClick={() => setConfirmEliminar(null)}
                      >
                        <span className="image-option-icon">↩️</span>
                        <div className="image-option-text">
                          <b>Cancelar</b>
                        </div>
                      </button>
                      <button
                        className="image-option"
                        onClick={confirmarEliminar}
                        style={{ borderColor: "rgba(239,68,68,0.3)" }}
                      >
                        <span className="image-option-icon">🗑️</span>
                        <div
                          className="image-option-text"
                          style={{ color: "#f87171" }}
                        >
                          <b>Sí, eliminar</b>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ MODAL: Editar servicio ══
                  e.stopPropagation() evita que el clic dentro del modal cierre el overlay */}
              {editando && (
                <div
                  className="image-menu-overlay active"
                  onClick={() => setEditando(null)}
                >
                  <div
                    className="image-menu"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      maxWidth: "500px",
                      maxHeight: "85vh",
                      overflowY: "auto",
                    }}
                  >
                    <h3 className="image-menu-title">✏️ Editar servicio</h3>

                    {/* Generamos los campos del formulario dinámicamente desde un array */}
                    {[
                      ["Título", "titulo", "text"],
                      ["Precio/hora", "precio_hora", "number"],
                      ["Contacto", "contacto", "text"],
                      ["Ícono", "icono", "text"],
                    ].map(([label, field, type]) => (
                      <div key={field} style={{ marginBottom: "14px" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.82rem",
                            opacity: 0.7,
                            marginBottom: "5px",
                          }}
                        >
                          {label}
                        </label>
                        <input
                          type={type}
                          value={editando[field] || ""}
                          onChange={(e) =>
                            setEditando({
                              ...editando,
                              [field]: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            color: "inherit",
                            fontSize: "0.9rem",
                          }}
                        />
                      </div>
                    ))}

                    <div style={{ marginBottom: "14px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.82rem",
                          opacity: 0.7,
                          marginBottom: "5px",
                        }}
                      >
                        Descripción
                      </label>
                      <textarea
                        rows={4}
                        value={editando.descripcion || ""}
                        onChange={(e) =>
                          setEditando({
                            ...editando,
                            descripcion: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          resize: "vertical",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          color: "inherit",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>

                    <div className="image-menu-options">
                      <button
                        className="image-option"
                        onClick={() => setEditando(null)}
                      >
                        <span className="image-option-icon">↩️</span>
                        <div className="image-option-text">
                          <b>Cancelar</b>
                        </div>
                      </button>
                      <button
                        className="image-option"
                        onClick={() => guardarEdicion(editando)}
                      >
                        <span className="image-option-icon">💾</span>
                        <div className="image-option-text">
                          <b>Guardar cambios</b>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ══ MODAL: Editar información del perfil (solo perfil propio) ══ */}
        {activeModal === "info" && (
          <div
            className="image-menu-overlay active"
            onClick={() => setActiveModal(null)}
          >
            <div className="image-menu" onClick={(e) => e.stopPropagation()}>
              <h3 className="image-menu-title">✍️ Editar Perfil</h3>
              <div className="image-menu-options">
                {/* Cada botón usa prompt() para pedir el nuevo valor y llama a handleUpdate */}

                <button
                  className="image-option"
                  onClick={() => {
                    const n = prompt("Nuevo nombre:", userData.nombre);
                    if (n) handleUpdate("nombre", n);
                  }}
                >
                  <span className="image-option-icon">✏️</span>
                  <div className="image-option-text">
                    <b>Cambiar Nombre</b>
                  </div>
                </button>

                <button
                  className="image-option"
                  onClick={() => {
                    const d = prompt(
                      "Nueva descripción:",
                      userData.descripcion,
                    );
                    if (d) handleUpdate("descripcion", d);
                  }}
                >
                  <span className="image-option-icon">📖</span>
                  <div className="image-option-text">
                    <b>Cambiar Descripción</b>
                  </div>
                </button>

                <button
                  className="image-option"
                  onClick={() => {
                    const e = prompt(
                      "Nueva universidad:",
                      userData.universidad,
                    );
                    if (e) handleUpdate("universidad", e);
                  }}
                >
                  <span className="image-option-icon">🏛️</span>
                  <div className="image-option-text">
                    <b>Cambiar Universidad</b>
                  </div>
                </button>

                <button
                  className="image-option"
                  onClick={() => {
                    const u = prompt(
                      "Nuevo número de teléfono:",
                      userData.telefono,
                    );
                    if (u) handleUpdate("telefono", u);
                  }}
                >
                  <span className="image-option-icon">📱</span>
                  <div className="image-option-text">
                    <b>Cambiar Teléfono</b>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ MODAL: Cambiar avatar (solo perfil propio) ══ 
            Dos opciones: URL externa o archivo local desde el dispositivo */}
        {activeModal === "imagen" && (
          <div
            className="image-menu-overlay active"
            onClick={() => setActiveModal(null)}
          >
            <div className="image-menu" onClick={(e) => e.stopPropagation()}>
              <h3 className="image-menu-title">📸 Cambiar Avatar</h3>
              {/* Input oculto: se activa programáticamente con FileInputRef.current.click() */}
              <input
                type="file"
                ref={FileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleSubirImagenLocal}
              />
              <div className="image-menu-options">
                <button
                  className="image-option"
                  onClick={() => {
                    const url = prompt("URL de la imagen:");
                    if (url) handleUpdate("avatar", url);
                  }}
                >
                  <span className="image-option-icon">🌐</span>
                  <div className="image-option-text">
                    <b>Usar URL</b>
                  </div>
                </button>
                <button
                  className="image-option"
                  onClick={() => FileInputRef.current?.click()}
                >
                  <span className="image-option-icon">📁</span>
                  <div className="image-option-text">
                    <b>Subir Imagen</b>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ MODAL: Actividad (solo perfil propio) ══ 
            Muestra estadísticas, logros y actividad reciente del usuario */}
        {activeModal === "actividad" && (
          <div
            className="activity-overlay active"
            onClick={() => setActiveModal(null)}
          >
            <div
              className="activity-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="activity-header">
                <h2 className="activity-title">📊 Mi Actividad</h2>
                <button
                  className="activity-close"
                  onClick={() => setActiveModal(null)}
                >
                  ✕
                </button>
              </div>
              <div className="activity-body">
                <div className="quick-stats">
                  <QuickStatCard icon="📝" value="12" label="Este Mes" />
                  <QuickStatCard icon="✅" value="45" label="Completados" />
                  <QuickStatCard
                    icon="⭐"
                    value={reputacionTexto.split("/")[0]}
                    label="Calificación"
                  />
                  <QuickStatCard icon="⏱️" value="45h" label="Tiempo Activo" />
                </div>
                <div className="progress-section">
                  <div className="progress-title">🏆 Logros y Metas</div>
                  <ProgressBar
                    label="🎯 Meta de publicaciones"
                    value="80%"
                    color="teal"
                  />
                  <ProgressBar
                    label="⭐ Satisfacción del cliente"
                    value="98%"
                    color="green"
                  />
                  <ProgressBar
                    label="📩 Tasa de respuesta"
                    value="95%"
                    color="yellow"
                  />
                </div>
                <div className="recent-activity">
                  <div className="recent-title">🕐 Actividad Reciente</div>
                  <div className="activity-list">
                    <ActivityItem
                      icon="✅"
                      text="Completaste el servicio 'Diseño de logo'"
                      time="Hace 2 horas"
                      badge="+5★"
                      type="success"
                    />
                    <ActivityItem
                      icon="💬"
                      text="Nuevo mensaje de María García"
                      time="Hace 5 horas"
                      badge="Nuevo"
                      type="info"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ── Subcomponentes reutilizables ──

// Muestra un número grande con su etiqueta (publicaciones, seguidores, siguiendo)
const StatItem = ({ value, label }) => (
  <div className="stat-item">
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

// Ítem de menú clickeable; danger=true aplica estilo rojo (usado en "Cerrar sesión")
const MenuItem = ({ icon, title, desc, tag, onClick, danger }) => (
  <div
    className="menu-item"
    onClick={onClick}
    style={{
      cursor: "pointer",
      ...(danger && { borderColor: "rgba(239, 68, 68, 0.3)" }),
    }}
  >
    <div
      className="menu-icon"
      style={danger ? { background: "rgba(239,68,68,0.15)" } : {}}
    >
      {icon}
    </div>
    <div className="menu-text">
      <div className="menu-title" style={danger ? { color: "#f87171" } : {}}>
        {title}
      </div>
      {desc && <div className="menu-desc">{desc}</div>}
    </div>
    {tag && <span className="status-tag online">{tag}</span>}
    <span className="menu-arrow" style={danger ? { color: "#f87171" } : {}}>
      →
    </span>
  </div>
);

// Muestra un par label/valor en la sección de información del perfil
const InfoItem = ({ label, value }) => (
  <div className="info-item">
    <div className="info-label">{label}</div>
    <div className="info-value">{value}</div>
  </div>
);

// Tarjeta compacta de estadística rápida dentro del modal de actividad
const QuickStatCard = ({ icon, value, label }) => (
  <div className="quick-stat-card">
    <div className="quick-stat-icon">{icon}</div>
    <div className="quick-stat-value">{value}</div>
    <div className="quick-stat-label">{label}</div>
  </div>
);

// Barra de progreso con porcentaje y color configurable (teal, green, yellow)
const ProgressBar = ({ label, value, color }) => (
  <div className="progress-item">
    <div className="progress-header">
      <span className="progress-label">{label}</span>
      <span className="progress-value">{value}</span>
    </div>
    <div className="progress-bar">
      <div className={`progress-fill ${color}`} style={{ width: value }}></div>
    </div>
  </div>
);

// Ítem de actividad reciente con ícono, texto, tiempo y badge de tipo (success, info, etc.)
const ActivityItem = ({ icon, text, time, badge, type }) => (
  <div className="activity-item">
    <div className="activity-icon">{icon}</div>
    <div className="activity-content">
      <div className="activity-text">{text}</div>
      <div className="activity-time">{time}</div>
    </div>
    <span className={`activity-badge ${type}`}>{badge}</span>
  </div>
);

export default Perfil;
