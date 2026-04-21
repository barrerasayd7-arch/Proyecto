import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import "../styles/StylePage/StylePerfil.css";

function calcularEstrellas(estrellas) {
  if (!Array.isArray(estrellas) || estrellas.length === 0) return { texto: "☆☆☆☆☆", prom: 0, num: 0 };
  const prom = estrellas.reduce((a, b) => a + Number(b), 0) / estrellas.length;
  const llenas = Math.round(prom);
  return {
    texto: "★".repeat(llenas) + "☆".repeat(5 - llenas),
    prom:  prom.toFixed(1),
    num:   estrellas.length,
  };
}

export default function PerfilExterno() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siguiendo, setSiguiendo] = useState(false);

  // Datos de ejemplo mientras no hay API
  const datosEjemplo = {
    nombre: "Sayd Barrera",
    username: "sayd",
    bio: "Estudiante de Ingeniería de Sistemas Universidad Popular del Cesar",
    email: "barrerasayd7@gmail.com",
    universidad: "Universidad Popular Del Cesar",
    reputacion: "4.0",
    estado: 1,
    fecha_registro: "2026-04-01",
    total_publicaciones: 3,
    total_seguidores: 1,
    total_siguiendo: 1,
    avatar: null,
    servicios: [
      {
        id: 1,
        titulo: "Desarrollo Web con React",
        descripcion: "Creación de interfaces modernas y funcionales",
        precio_hora: 35000,
        icono: "💻"
      }
    ]
  };

  useEffect(() => {
    document.body.classList.add("perfil-page");

    const pd = location.state?.proveedorData;
    if (pd) {
      setUsuario({
        nombre: pd.nombre,
        username: pd.nombre.toLowerCase().replace(/\s/g, ''),
        bio: `Proveedor de servicios en ${pd.universidad}`,
        email: pd.contacto && pd.contacto.includes('@') ? pd.contacto : '',
        universidad: pd.universidad,
        reputacion: pd.estrellas ? calcularEstrellas(pd.estrellas).prom : "0.0",
        estado: 1,
        fecha_registro: "2026-04-01",
        total_publicaciones: 1,
        total_seguidores: 0,
        total_siguiendo: 0,
        avatar: null,
        servicios: []
      });
      setLoading(false);
    } else {
      // Aquí irá el fetch a la API cuando esté lista
      // fetch(`http://localhost/api/crud/UserPerfil.php?id=${id}`)
      //   .then(r => r.json())
      //   .then(data => setUsuario(data))
      //   .finally(() => setLoading(false));

      // Por ahora usamos datos de ejemplo
      setTimeout(() => {
        setUsuario(datosEjemplo);
        setLoading(false);
      }, 300);
    }

    return () => document.body.classList.remove("perfil-page");
  }, [id, location.state]);

  const handleSeguir = () => {
    setSiguiendo(!siguiendo);
    // Aquí irá la lógica de seguir/dejar de seguir
  };

  const handleCompartir = () => {
    if (navigator.share) {
      navigator.share({ title: `Perfil de ${usuario?.nombre}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("✓ Enlace copiado al portapapeles");
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha desconocida";
    return new Date(fecha).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  const formatearNumero = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num;
  };

  if (loading) return (
    <div className="perfil-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <p style={{ color: "var(--texto2)" }}>Cargando perfil...</p>
    </div>
  );

  const datos = usuario || datosEjemplo;

  return (
    <div className="perfil-container">

      {/* NAVBAR */}
      <nav className="navbar-custom">
        <div className="container">
          <Link to="/home" className="navbar-brand-custom">UniService</Link>
          <div className="navbar-links">
            <Link to="/home" className="nav-link-custom">Inicio</Link>
            <Link to="/home#buscar" className="nav-link-custom">Servicios</Link>
            <Link to="/perfil" className="nav-link-custom">Mi Perfil</Link>
          </div>
        </div>
      </nav>

      {/* TARJETA PRINCIPAL */}
      <main className="main-container">
        <div className="profile-wrapper">

          {/* COLUMNA IZQUIERDA */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-wrapper">
                <div className="avatar-ring"></div>
                <img
                  src={
                    datos.avatar
                      ? datos.avatar.startsWith("http") || datos.avatar.startsWith("data:")
                        ? datos.avatar
                        : `http://localhost/${datos.avatar}`
                      : new URL("../img/default_avatar.png", import.meta.url).href
                  }
                  alt="Avatar"
                  className="avatar"
                  style={{ cursor: "default" }}
                />
                <div className={`status-badge ${datos.estado == 1 ? "online" : "busy"}`} id="statusIndicator" />
              </div>
              <h1 className="profile-name">{datos.nombre}</h1>
              <p className="profile-username">@{datos.nombre?.toLowerCase().replace(/\s/g, "") || "usuario"}</p>
            </div>

            <div className="profile-body">
              <p className="profile-bio">{datos.bio || "Sin descripción"}</p>

              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{datos.total_publicaciones || 0}</div>
                  <div className="stat-label">Publicaciones</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{formatearNumero(datos.total_seguidores || 0)}</div>
                  <div className="stat-label">Seguidores</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{datos.total_siguiendo || 0}</div>
                  <div className="stat-label">Siguiendo</div>
                </div>
              </div>

              {/* Botones de acción — SIN editar */}
              <div className="action-buttons">
                <button
                  className={`btn ${siguiendo ? "btn-secondary" : "btn-primary"}`}
                  onClick={handleSeguir}
                >
                  {siguiendo ? "✓ Siguiendo" : "➕ Seguir"}
                </button>
                <button className="btn btn-secondary" onClick={handleCompartir}>
                  🔗 Compartir
                </button>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="right-panel">

            {/* Estado */}
            <div className="menu-section">
              <div className="section-title">📊 Estado</div>
              <div className="menu-list">
                <div className="menu-item" style={{ cursor: "default" }}>
                  <div className="menu-icon">{datos.estado == 1 ? "🟢" : "🔴"}</div>
                  <div className="menu-text">
                    <div className="menu-title">Estado actual</div>
                    <div className="menu-desc">{datos.estado == 1 ? "Disponible" : "No disponible"}</div>
                  </div>
                  <span className={`status-tag ${datos.estado == 1 ? "online" : "busy"}`}>
                    {datos.estado == 1 ? "En línea" : "Desconectado"}
                  </span>
                </div>
              </div>
            </div>

            {/* Información */}
            <div className="menu-section">
              <div className="section-title">📋 Información</div>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">📧 Correo</div>
                  <div className="info-value">{datos.email || "No especificado"}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">📅 Miembro desde</div>
                  <div className="info-value">{formatearFecha(datos.fecha_registro)}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">🏫 Universidad</div>
                  <div className="info-value">{datos.universidad || "No especificada"}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">⭐ Reputación</div>
                  <div className="info-value">
                    {datos.reputacion && datos.reputacion !== "N/A"
                      ? parseFloat(datos.reputacion).toFixed(1) + "/5.0"
                      : "Sin calificaciones"}
                  </div>
                </div>
              </div>
            </div>

            {/* Servicios publicados */}
            <div className="menu-section">
              <div className="section-title">💼 Servicios publicados</div>
              <div className="menu-list">
                {datos.servicios && datos.servicios.length > 0 ? (
                  datos.servicios.map((s, i) => (
                    <Link
                      key={i}
                      to={`/servicio?id=${s.id}`}
                      className="menu-item"
                    >
                      <div className="menu-icon">{s.icono || "📌"}</div>
                      <div className="menu-text">
                        <div className="menu-title">{s.titulo}</div>
                        <div className="menu-desc">${Number(s.precio_hora).toLocaleString()}/hora</div>
                      </div>
                      <span className="menu-arrow">→</span>
                    </Link>
                  ))
                ) : (
                  <p style={{ color: "var(--texto2)", padding: "12px", fontSize: "0.9rem" }}>
                    Este usuario no tiene servicios publicados.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}