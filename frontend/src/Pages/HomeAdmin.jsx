import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StylePage/styleAdmin.css";

// ── Constantes ──
const API = "http://localhost:5165/api";

// ── Helpers ──
function formatFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function Badge({ estado }) {
  const label = estado?.toLowerCase() || "—";
  return (
    <span className={`admin-badge admin-badge--${label}`}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

// ── Navbar Admin ──
function NavbarAdmin({ seccionActual, setSeccion, onCerrarSesion }) {
  const adminNombre = localStorage.getItem("usuario") || "Administrador";

  const secciones = [
    { id: "dashboard",  icon: "⬛", label: "Dashboard" },
    { id: "usuarios",   icon: "👥", label: "Usuarios" },
    { id: "servicios",  icon: "📋", label: "Servicios" },
    { id: "reportes",   icon: "🚩", label: "Reportes" },
    { id: "categorias", icon: "🏷️", label: "Categorías" },
    { id: "logs",       icon: "📜", label: "Actividad" },
  ];

  return (
    <nav className="admin-nav">
      <div className="admin-nav__logo-container">
        <div className="admin-nav__logo-icon">A</div>
        <span className="admin-nav__logo-text">
          Uni<span className="admin-nav__logo-text--highlight">Admin</span>
        </span>
        <span className="admin-nav__badge-internal">PANEL INTERNO</span>
      </div>

      <div className="admin-nav__links">
        {secciones.map(s => (
          <button 
            key={s.id} 
            type="button" 
            onClick={() => setSeccion(s.id)}
            className={`admin-nav__btn ${seccionActual === s.id ? 'is-active' : ''}`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="admin-nav__user">
        <div className="admin-nav__user-info">
          🛡️ {adminNombre}
        </div>
        <button type="button" onClick={onCerrarSesion} className="admin-nav__logout">
          Salir
        </button>
      </div>
    </nav>
  );
}

// ── Tarjeta estadística ──
function StatCard({ icon, label, value, sub, type }) {
  return (
    <div className={`admin-stat-card admin-stat-card--${type}`}>
      <div className="admin-stat-card__border-top" />
      <div className="admin-stat-card__icon">{icon}</div>
      <div className="admin-stat-card__value">{value}</div>
      <div className="admin-stat-card__label">{label}</div>
      {sub && <div className="admin-stat-card__sub">{sub}</div>}
    </div>
  );
}

// ── Dashboard ──
function SeccionDashboard() {
  const [stats] = useState({ totalUsuarios: 142, totalServicios: 87, totalSolicitudes: 234, reportesPendientes: 5 });

  const actividad = [
    { accion: "Usuario registrado",   detalle: "carlos.m@upc.edu.co",     hora: "hace 3 min",   tipo: "usuario" },
    { accion: "Servicio publicado",   detalle: "Tutoría de Cálculo",       hora: "hace 8 min",   tipo: "servicio" },
    { accion: "Reporte recibido",     detalle: "Servicio ID #45",          hora: "hace 15 min",  tipo: "reporte" },
    { accion: "Usuario suspendido",   detalle: "user@ejemplo.com",         hora: "hace 22 min",  tipo: "alerta" },
    { accion: "Categoría creada",     detalle: "🔬 Ciencias exactas",      hora: "hace 1 hora",  tipo: "categoria" },
    { accion: "Solicitud respondida", detalle: "ID #112 → Aceptada",       hora: "hace 2 horas", tipo: "servicio" },
  ];

  return (
    <section className="admin-dashboard">
      <div className="admin-header">
        <p className="admin-header__pre">Panel de control</p>
        <h1 className="admin-header__title">Dashboard</h1>
      </div>

      <div className="admin-stats-grid">
        <StatCard icon="👥" label="Usuarios registrados" value={stats.totalUsuarios} sub="↑ 12 esta semana" type="primary" />
        <StatCard icon="📋" label="Servicios activos" value={stats.totalServicios} sub="↑ 7 nuevos hoy" type="success" />
        <StatCard icon="🔁" label="Solicitudes totales" value={stats.totalSolicitudes} sub="↑ 23 esta semana" type="info" />
        <StatCard icon="🚩" label="Reportes pendientes" value={stats.reportesPendientes} sub="Requieren revisión" type="danger" />
      </div>

      <div className="admin-activity-card">
        <p className="admin-activity-card__title">📜 Actividad reciente</p>
        <div className="admin-activity-list">
          {actividad.map((a, i) => (
            <div key={i} className="admin-activity-item">
              <div className={`admin-activity-item__dot admin-activity-item__dot--${a.tipo}`} />
              <span className="admin-activity-item__action">{a.accion}</span>
              <span className="admin-activity-item__detail">{a.detalle}</span>
              <span className="admin-activity-item__time">{a.hora}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Usuarios ──
function SeccionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API}/users`)
      .then(r => r.json())
      .then(data => setUsuarios(Array.isArray(data) ? data : []))
      .catch(() => setUsuarios([]))
      .finally(() => setCargando(false));
  }, []);

  const suspender = async (id) => {
    if (!confirm("¿Suspender este usuario?")) return;
    await fetch(`${API}/users/${id}/suspender`, { method: "PUT" });
    setUsuarios(prev => prev.map(u => u.id_usuario === id ? { ...u, estado: "Suspendido" } : u));
  };

  const eliminar = async (id) => {
    if (!confirm("⚠️ ¿Eliminar este usuario? Esta acción no se puede deshacer.")) return;
    await fetch(`${API}/users/${id}`, { method: "DELETE" });
    setUsuarios(prev => prev.filter(u => u.id_usuario !== id));
  };

  const filtrados = usuarios.filter(u =>
    [u.nombre, u.correo, u.rol].some(v => (v || "").toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <p className="admin-section__pre">Gestión</p>
          <h2 className="admin-section__title">Usuarios</h2>
        </div>
        <input 
          className="admin-input-search"
          type="text" 
          placeholder="🔍 Buscar usuario..."
          value={busqueda} 
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {["ID", "Nombre", "Correo", "Rol", "Estado", "Fecha registro", "Acciones"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={7} className="admin-table__status">Cargando...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={7} className="admin-table__status">No se encontraron usuarios.</td></tr>
            ) : filtrados.map((u) => (
              <tr key={u.id_usuario}>
                <td className="admin-table__id">#{u.id_usuario}</td>
                <td>
                  <div className="admin-table__user-info">
                    <div className="admin-table__avatar">{(u.nombre || "?").charAt(0).toUpperCase()}</div>
                    {u.nombre}
                  </div>
                </td>
                <td className="admin-table__email">{u.correo}</td>
                <td>
                  <span className={`admin-role-badge admin-role-badge--${u.rol || 'usuario'}`}>
                    {u.rol || "usuario"}
                  </span>
                </td>
                <td><Badge estado={u.estado || "activo"} /></td>
                <td className="admin-table__date">{formatFecha(u.fecha_registro)}</td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-btn-action admin-btn-action--warning" onClick={() => suspender(u.id_usuario)}>Suspender</button>
                    <button className="admin-btn-action admin-btn-action--danger" onClick={() => eliminar(u.id_usuario)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Servicios Admin ──
function SeccionServiciosAdmin() {
  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API}/services`)
      .then(r => r.json())
      .then(data => setServicios(Array.isArray(data) ? data : []))
      .catch(() => setServicios([]))
      .finally(() => setCargando(false));
  }, []);

  const eliminar = async (id) => {
    if (!confirm("⚠️ ¿Eliminar este servicio?")) return;
    await fetch(`${API}/services/${id}`, { method: "DELETE" });
    setServicios(prev => prev.filter(s => s.id_servicio !== id));
  };

  const pausar = async (id) => {
    await fetch(`${API}/services/${id}/pausar`, { method: "PUT" });
    setServicios(prev => prev.map(s => s.id_servicio === id ? { ...s, estado: "inactivo" } : s));
  };

  const filtrados = servicios.filter(s =>
    [s.titulo, s.proveedor, s.nombre_categoria].some(v => (v || "").toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <p className="admin-section__pre admin-section__pre--success">Gestión</p>
          <h2 className="admin-section__title">Servicios</h2>
        </div>
        <input 
          className="admin-input-search"
          type="text" 
          placeholder="🔍 Buscar servicio..."
          value={busqueda} 
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {["Servicio", "Proveedor", "Categoría", "Precio/hr", "Fecha", "Acciones"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={6} className="admin-table__status">Cargando...</td></tr>
            ) : filtrados.map((s) => (
              <tr key={s.id_servicio}>
                <td>
                  <div className="admin-table__service-info">
                    <span className="admin-table__service-icon">{s.icono || "📌"}</span>
                    <div>
                      <p className="admin-table__service-name">{s.titulo}</p>
                      <p className="admin-table__id">ID #{s.id_servicio}</p>
                    </div>
                  </div>
                </td>
                <td className="admin-table__provider">{s.proveedor}</td>
                <td className="admin-table__category">{s.nombre_categoria}</td>
                <td className="admin-table__price">${(s.precio_hora || 0).toLocaleString("es-CO")}</td>
                <td className="admin-table__date">{formatFecha(s.fecha_publicacion)}</td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-btn-action admin-btn-action--warning" onClick={() => pausar(s.id_servicio)}>Pausar</button>
                    <button className="admin-btn-action admin-btn-action--danger" onClick={() => eliminar(s.id_servicio)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Reportes ──
function SeccionReportes() {
  const [reportes, setReportes] = useState([
    { id: 1, tipo: "Servicio inapropiado", descripcion: "Contenido que no corresponde a servicios académicos", reportado: "Tutoría de Marketing Digital", reportadoPor: "juan.c@upc.edu.co", fecha: "2026-04-28", estado: "pendiente" },
    { id: 2, tipo: "Usuario sospechoso",   descripcion: "El usuario contacta fuera de la plataforma y solicita pagos externos", reportado: "carlos.vendedor@gmail.com", reportadoPor: "ana.r@unicesar.edu.co", fecha: "2026-04-27", estado: "pendiente" },
    { id: 3, tipo: "Precio abusivo",       descripcion: "Cobra 5 veces más de lo normal por tutorías básicas", reportado: "Tutoría de Álgebra Lineal", reportadoPor: "pedro.m@upc.edu.co", fecha: "2026-04-26", estado: "cerrada" },
  ]);

  const resolver = (id) => setReportes(prev => prev.map(r => r.id === id ? { ...r, estado: "cerrada" } : r));

  return (
    <section className="admin-section">
      <div className="admin-header">
        <p className="admin-header__pre admin-header__pre--danger">Moderación</p>
        <h2 className="admin-header__title">Reportes</h2>
      </div>
      <div className="admin-reports-list">
        {reportes.map(r => (
          <div key={r.id} className={`admin-report-card admin-report-card--${r.estado}`}>
            <div className="admin-report-card__header">
              <div className="admin-report-card__info">
                <span className="admin-report-card__icon">{r.estado === "pendiente" ? "🚩" : "✅"}</span>
                <div>
                  <p className="admin-report-card__type">{r.tipo}</p>
                  <p className="admin-report-card__meta">
                    Reportado: <span>{r.reportado}</span> · Por: <span>{r.reportadoPor}</span> · {formatFecha(r.fecha)}
                  </p>
                </div>
              </div>
              <Badge estado={r.estado} />
            </div>
            <p className="admin-report-card__desc">{r.descripcion}</p>
            {r.estado === "pendiente" && (
              <div className="admin-report-card__actions">
                <button className="admin-btn-action admin-btn-action--success" onClick={() => resolver(r.id)}>✅ Marcar resuelta</button>
                <button className="admin-btn-action admin-btn-action--danger">🚫 Tomar acción</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Categorías ──
function SeccionCategorias() {
  const [categorias, setCategorias] = useState([
    { id: 1, nombre: "Tutorías",     icono: "📚", servicios: 34 },
    { id: 2, nombre: "Ensayos",      icono: "✍️", servicios: 12 },
    { id: 3, nombre: "Proyectos",    icono: "🗂️", servicios: 8  },
    { id: 4, nombre: "Programación", icono: "💻", servicios: 21 },
    { id: 5, nombre: "Diseño",       icono: "🎨", servicios: 7  },
    { id: 6, nombre: "Arriendo",     icono: "🏠", servicios: 5  },
    { id: 7, nombre: "Otros",        icono: "🌐", servicios: 3  },
  ]);
  const [nueva, setNueva] = useState({ nombre: "", icono: "" });
  const [agregando, setAgregando] = useState(false);

  const agregar = () => {
    if (!nueva.nombre.trim()) return;
    setCategorias(prev => [...prev, { id: Date.now(), nombre: nueva.nombre, icono: nueva.icono || "📌", servicios: 0 }]);
    setNueva({ nombre: "", icono: "" });
    setAgregando(false);
  };

  const eliminar = (id) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    setCategorias(prev => prev.filter(c => c.id !== id));
  };

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <p className="admin-section__pre admin-section__pre--info">Configuración</p>
          <h2 className="admin-section__title">Categorías</h2>
        </div>
        <button className="admin-btn-new" onClick={() => setAgregando(true)}>+ Nueva categoría</button>
      </div>

      {agregando && (
        <div className="admin-category-form">
          <input className="admin-category-form__icon" type="text" placeholder="Emoji" value={nueva.icono} onChange={e => setNueva(p => ({ ...p, icono: e.target.value }))} />
          <input className="admin-category-form__name" type="text" placeholder="Nombre" value={nueva.nombre} onChange={e => setNueva(p => ({ ...p, nombre: e.target.value }))} />
          <button className="admin-btn-action admin-btn-action--info" onClick={agregar}>Crear</button>
          <button className="admin-btn-action admin-btn-action--ghost" onClick={() => setAgregando(false)}>Cancelar</button>
        </div>
      )}

      <div className="admin-category-grid">
        {categorias.map(c => (
          <div key={c.id} className="admin-category-card">
            <div className="admin-category-card__header">
              <span className="admin-category-card__icon">{c.icono}</span>
              <button className="admin-category-card__delete" onClick={() => eliminar(c.id)}>✕</button>
            </div>
            <p className="admin-category-card__name">{c.nombre}</p>
            <p className="admin-category-card__count">{c.servicios} servicios activos</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Logs ──
function SeccionLogs() {
  const logs = [
    { id: 1, admin: "admin@uniservice.co", accion: "Eliminó usuario", detalle: "user_id: 34", ip: "192.168.1.1", fecha: "2026-04-29 14:32" },
    { id: 2, admin: "admin@uniservice.co", accion: "Suspendió servicio", detalle: "service_id: 88", ip: "192.168.1.1", fecha: "2026-04-29 13:10" },
  ];

  return (
    <section className="admin-section">
      <div className="admin-header">
        <p className="admin-header__pre admin-header__pre--info">Auditoría</p>
        <h2 className="admin-header__title">Registro de actividad</h2>
      </div>
      <div className="admin-table-container">
        <table className="admin-table admin-table--logs">
          <thead>
            <tr>
              {["#", "Admin", "Acción", "Detalle", "IP", "Fecha"].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="admin-table__id">{l.id}</td>
                <td className="admin-table__admin">{l.admin}</td>
                <td><span className="admin-log-action">{l.accion}</span></td>
                <td className="admin-table__detail">{l.detalle}</td>
                <td className="admin-table__ip">{l.ip}</td>
                <td className="admin-table__date">{l.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Componente raíz ──
export default function HomeAdmin() {
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol   = localStorage.getItem("rol");
    if (!token || rol !== "admin") navigate("/login");
  }, [navigate]);

  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate("/login");
  };

  const vistas = {
    dashboard:  <SeccionDashboard />,
    usuarios:   <SeccionUsuarios />,
    servicios:  <SeccionServiciosAdmin />,
    reportes:   <SeccionReportes />,
    categorias: <SeccionCategorias />,
    logs:       <SeccionLogs />,
  };

  return (
    <div className="admin-layout">
      <NavbarAdmin seccionActual={seccion} setSeccion={setSeccion} onCerrarSesion={handleCerrarSesion} />
      <main className="admin-main">
        <div className="admin-bg-decorative" />
        <div className="admin-container">
          {vistas[seccion] ?? <SeccionDashboard />}
        </div>
      </main>
    </div>
  );
}