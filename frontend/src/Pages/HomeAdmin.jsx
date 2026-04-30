import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Constantes ──
const API = "http://localhost:3000/api";

// ── Helpers ──
function formatFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function Badge({ estado }) {
  const map = {
    activo:     { bg: "rgba(16,185,129,0.15)",  color: "#10B981", label: "Activo" },
    inactivo:   { bg: "rgba(239,68,68,0.15)",   color: "#EF4444", label: "Inactivo" },
    pendiente:  { bg: "rgba(245,158,11,0.15)",  color: "#F59E0B", label: "Pendiente" },
    suspendido: { bg: "rgba(239,68,68,0.15)",   color: "#EF4444", label: "Suspendido" },
    activa:     { bg: "rgba(16,185,129,0.15)",  color: "#10B981", label: "Activa" },
    cerrada:    { bg: "rgba(100,116,139,0.15)", color: "#94A3B8", label: "Cerrada" },
  };
  const s = map[estado?.toLowerCase()] || { bg: "rgba(100,116,139,0.15)", color: "#94A3B8", label: estado || "—" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.03em",
    }}>{s.label}</span>
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
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: "rgba(7,10,20,0.94)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(239,68,68,0.2)",
      padding: "0 32px", height: "60px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <div style={{
          background: "linear-gradient(135deg, #EF4444, #DC2626)",
          width: "32px", height: "32px", borderRadius: "8px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", fontWeight: 800, color: "#fff",
        }}>A</div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#fff", whiteSpace: "nowrap" }}>
          Uni<span style={{ color: "#EF4444" }}>Admin</span>
        </span>
        <span style={{
          background: "rgba(239,68,68,0.15)", color: "#EF4444",
          fontSize: "0.62rem", fontWeight: 700, padding: "2px 8px",
          borderRadius: "4px", letterSpacing: "0.1em", border: "1px solid rgba(239,68,68,0.3)",
          whiteSpace: "nowrap",
        }}>PANEL INTERNO</span>
      </div>

      {/* Links */}
      <div style={{ display: "flex", gap: "2px", flex: 1, justifyContent: "center" }}>
        {secciones.map(s => (
          <button key={s.id} type="button" onClick={() => setSeccion(s.id)}
            style={{
              background: seccionActual === s.id ? "rgba(239,68,68,0.15)" : "transparent",
              border: seccionActual === s.id ? "1px solid rgba(239,68,68,0.35)" : "1px solid transparent",
              color: seccionActual === s.id ? "#EF4444" : "rgba(255,255,255,0.5)",
              padding: "6px 12px", borderRadius: "8px",
              fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s", whiteSpace: "nowrap",
            }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Usuario */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "8px", padding: "5px 12px",
          fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap",
        }}>
          🛡️ {adminNombre}
        </div>
        <button type="button" onClick={onCerrarSesion} style={{
          background: "transparent", border: "1px solid rgba(239,68,68,0.3)",
          color: "#EF4444", padding: "5px 12px", borderRadius: "8px",
          fontSize: "0.78rem", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap",
        }}>Salir</button>
      </div>
    </nav>
  );
}

// ── Tarjeta estadística ──
function StatCard({ icon, label, value, sub, accent = "#EF4444" }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "14px", padding: "22px 24px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: accent,
      }} />
      <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>{icon}</div>
      <div style={{ fontSize: "2rem", fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>{label}</div>
      {sub && <div style={{ fontSize: "0.72rem", color: accent, marginTop: "6px", fontWeight: 600 }}>{sub}</div>}
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

  const colorTipo = {
    usuario: "#818CF8", servicio: "#10B981",
    reporte: "#EF4444", alerta: "#F59E0B", categoria: "#06B6D4",
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <p style={{ color: "#EF4444", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>Panel de control</p>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "2rem", fontWeight: 800, color: "#fff", margin: 0 }}>Dashboard</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "32px" }}>
        <StatCard icon="👥" label="Usuarios registrados" value={stats.totalUsuarios}    sub="↑ 12 esta semana"  accent="#818CF8" />
        <StatCard icon="📋" label="Servicios activos"    value={stats.totalServicios}   sub="↑ 7 nuevos hoy"    accent="#10B981" />
        <StatCard icon="🔁" label="Solicitudes totales"  value={stats.totalSolicitudes} sub="↑ 23 esta semana"  accent="#06B6D4" />
        <StatCard icon="🚩" label="Reportes pendientes"  value={stats.reportesPendientes} sub="Requieren revisión" accent="#EF4444" />
      </div>

      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px", padding: "24px",
      }}>
        <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff", margin: "0 0 20px" }}>
          📜 Actividad reciente
        </p>
        {actividad.map((a, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "14px",
            padding: "12px 0",
            borderBottom: i < actividad.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
          }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
              background: colorTipo[a.tipo] || "#fff",
              boxShadow: `0 0 8px ${colorTipo[a.tipo] || "#fff"}`,
            }} />
            <span style={{ flex: 1, fontSize: "0.83rem", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{a.accion}</span>
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", flex: 2 }}>{a.detalle}</span>
            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>{a.hora}</span>
          </div>
        ))}
      </div>
    </div>
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
    [u.nombre, u.correo, u.rol].some(v =>
      (v || "").toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <p style={{ color: "#818CF8", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>Gestión</p>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff", margin: 0 }}>Usuarios</h2>
        </div>
        <input type="text" placeholder="🔍 Buscar usuario..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px", padding: "10px 16px", color: "#fff", fontSize: "0.83rem",
            outline: "none", width: "260px",
          }}
        />
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["ID", "Nombre", "Correo", "Rol", "Estado", "Fecha registro", "Acciones"].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>Cargando...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>No se encontraron usuarios.</td></tr>
            ) : filtrados.map((u, i) => (
              <tr key={u.id_usuario} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>#{u.id_usuario}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "#fff", fontWeight: 600 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "rgba(129,140,248,0.2)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", fontWeight: 800, color: "#818CF8",
                    }}>{(u.nombre || "?").charAt(0).toUpperCase()}</div>
                    {u.nombre}
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>{u.correo}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    background: u.rol === "admin" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.07)",
                    color: u.rol === "admin" ? "#EF4444" : "rgba(255,255,255,0.5)",
                    padding: "2px 8px", borderRadius: "4px", fontWeight: 700, fontSize: "0.7rem",
                  }}>{u.rol || "usuario"}</span>
                </td>
                <td style={{ padding: "12px 16px" }}><Badge estado={u.estado || "activo"} /></td>
                <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>{formatFecha(u.fecha_registro)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button type="button" onClick={() => suspender(u.id_usuario)} style={{
                      background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                      color: "#F59E0B", padding: "4px 10px", borderRadius: "6px",
                      fontSize: "0.72rem", cursor: "pointer", fontWeight: 600,
                    }}>Suspender</button>
                    <button type="button" onClick={() => eliminar(u.id_usuario)} style={{
                      background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                      color: "#EF4444", padding: "4px 10px", borderRadius: "6px",
                      fontSize: "0.72rem", cursor: "pointer", fontWeight: 600,
                    }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
    [s.titulo, s.proveedor, s.nombre_categoria].some(v =>
      (v || "").toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <p style={{ color: "#10B981", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>Gestión</p>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff", margin: 0 }}>Servicios</h2>
        </div>
        <input type="text" placeholder="🔍 Buscar servicio..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px", padding: "10px 16px", color: "#fff", fontSize: "0.83rem",
            outline: "none", width: "260px",
          }}
        />
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Servicio", "Proveedor", "Categoría", "Precio/hr", "Fecha", "Acciones"].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>Cargando...</td></tr>
            ) : filtrados.map((s, i) => (
              <tr key={s.id_servicio} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.2rem" }}>{s.icono || "📌"}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#fff", fontWeight: 600 }}>{s.titulo}</p>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>ID #{s.id_servicio}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>{s.proveedor}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>{s.nombre_categoria}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "#10B981", fontWeight: 700 }}>${(s.precio_hora || 0).toLocaleString("es-CO")}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>{formatFecha(s.fecha_publicacion)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button type="button" onClick={() => pausar(s.id_servicio)} style={{
                      background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                      color: "#F59E0B", padding: "4px 10px", borderRadius: "6px",
                      fontSize: "0.72rem", cursor: "pointer", fontWeight: 600,
                    }}>Pausar</button>
                    <button type="button" onClick={() => eliminar(s.id_servicio)} style={{
                      background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                      color: "#EF4444", padding: "4px 10px", borderRadius: "6px",
                      fontSize: "0.72rem", cursor: "pointer", fontWeight: 600,
                    }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
    <div>
      <div style={{ marginBottom: "28px" }}>
        <p style={{ color: "#EF4444", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>Moderación</p>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff", margin: 0 }}>Reportes</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {reportes.map(r => (
          <div key={r.id} style={{
            background: r.estado === "pendiente" ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${r.estado === "pendiente" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
            borderRadius: "14px", padding: "20px 24px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ fontSize: "1.3rem" }}>{r.estado === "pendiente" ? "🚩" : "✅"}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: "#fff", fontSize: "0.92rem" }}>{r.tipo}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                    Reportado: <span style={{ color: "rgba(255,255,255,0.6)" }}>{r.reportado}</span>
                    &nbsp;·&nbsp;Por: <span style={{ color: "rgba(255,255,255,0.6)" }}>{r.reportadoPor}</span>
                    &nbsp;·&nbsp;{formatFecha(r.fecha)}
                  </p>
                </div>
              </div>
              <Badge estado={r.estado} />
            </div>
            <p style={{ margin: "0 0 14px", fontSize: "0.83rem", color: "rgba(255,255,255,0.55)", paddingLeft: "42px" }}>{r.descripcion}</p>
            {r.estado === "pendiente" && (
              <div style={{ display: "flex", gap: "8px", paddingLeft: "42px" }}>
                <button type="button" onClick={() => resolver(r.id)} style={{
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                  color: "#10B981", padding: "6px 14px", borderRadius: "8px",
                  fontSize: "0.78rem", cursor: "pointer", fontWeight: 600,
                }}>✅ Marcar como resuelta</button>
                <button type="button" style={{
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  color: "#EF4444", padding: "6px 14px", borderRadius: "8px",
                  fontSize: "0.78rem", cursor: "pointer", fontWeight: 600,
                }}>🚫 Tomar acción</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
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
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <p style={{ color: "#06B6D4", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>Configuración</p>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff", margin: 0 }}>Categorías</h2>
        </div>
        <button type="button" onClick={() => setAgregando(true)} style={{
          background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)",
          color: "#06B6D4", padding: "8px 16px", borderRadius: "10px",
          fontSize: "0.82rem", cursor: "pointer", fontWeight: 700,
        }}>+ Nueva categoría</button>
      </div>

      {agregando && (
        <div style={{
          background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.25)",
          borderRadius: "14px", padding: "20px 24px", marginBottom: "20px",
          display: "flex", gap: "12px", alignItems: "center",
        }}>
          <input type="text" placeholder="Emoji" value={nueva.icono}
            onChange={e => setNueva(p => ({ ...p, icono: e.target.value }))}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", color: "#fff", fontSize: "1.2rem", outline: "none", width: "70px", textAlign: "center" }}
          />
          <input type="text" placeholder="Nombre de la categoría" value={nueva.nombre}
            onChange={e => setNueva(p => ({ ...p, nombre: e.target.value }))}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 16px", color: "#fff", fontSize: "0.85rem", outline: "none", flex: 1 }}
          />
          <button type="button" onClick={agregar} style={{ background: "#06B6D4", border: "none", color: "#000", padding: "8px 18px", borderRadius: "8px", fontSize: "0.82rem", cursor: "pointer", fontWeight: 700 }}>Crear</button>
          <button type="button" onClick={() => setAgregando(false)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", padding: "8px 14px", borderRadius: "8px", fontSize: "0.82rem", cursor: "pointer" }}>Cancelar</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
        {categorias.map(c => (
          <div key={c.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "2rem" }}>{c.icono}</span>
              <button type="button" onClick={() => eliminar(c.id)} style={{ background: "transparent", border: "none", color: "rgba(239,68,68,0.5)", cursor: "pointer", fontSize: "0.8rem", padding: "2px 6px" }}>✕</button>
            </div>
            <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#fff", fontSize: "0.92rem" }}>{c.nombre}</p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{c.servicios} servicios activos</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Logs ──
function SeccionLogs() {
  const logs = [
    { id: 1, admin: "admin@uniservice.co", accion: "Eliminó usuario",    detalle: "user_id: 34 — spam@ejemplo.com",          ip: "192.168.1.1", fecha: "2026-04-29 14:32" },
    { id: 2, admin: "admin@uniservice.co", accion: "Suspendió servicio", detalle: "service_id: 88 — Tutoría sospechosa",      ip: "192.168.1.1", fecha: "2026-04-29 13:10" },
    { id: 3, admin: "admin@uniservice.co", accion: "Creó categoría",     detalle: "🔬 Ciencias exactas",                      ip: "192.168.1.1", fecha: "2026-04-28 09:55" },
    { id: 4, admin: "admin@uniservice.co", accion: "Resolvió reporte",   detalle: "report_id: 7",                             ip: "10.0.0.4",    fecha: "2026-04-27 16:44" },
    { id: 5, admin: "admin@uniservice.co", accion: "Inició sesión",      detalle: "Login exitoso",                            ip: "192.168.1.1", fecha: "2026-04-27 08:01" },
  ];

  const colorAccion = (a) => {
    if (a.includes("Elimin"))    return "#EF4444";
    if (a.includes("Suspendió")) return "#F59E0B";
    if (a.includes("Creó"))      return "#10B981";
    if (a.includes("Resolvió"))  return "#06B6D4";
    return "#818CF8";
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <p style={{ color: "#818CF8", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>Auditoría</p>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff", margin: 0 }}>Registro de actividad</h2>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["#", "Administrador", "Acción", "Detalle", "IP", "Fecha"].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={l.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                <td style={{ padding: "12px 16px", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>{l.id}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "rgba(255,255,255,0.55)" }}>{l.admin}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ color: colorAccion(l.accion), fontWeight: 700, fontSize: "0.8rem", background: `${colorAccion(l.accion)}18`, padding: "3px 8px", borderRadius: "6px" }}>
                    {l.accion}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{l.detalle}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{l.ip}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>{l.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Componente raíz ──
export default function HomeAdmin() {
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol   = localStorage.getItem("rol");
    // Redirige si no es admin — protege la ruta en el cliente
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070A14; color: #fff; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0D1020; }
        ::-webkit-scrollbar-thumb { background: rgba(239,68,68,0.3); border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
        button { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <NavbarAdmin seccionActual={seccion} setSeccion={setSeccion} onCerrarSesion={handleCerrarSesion} />

      <main style={{ paddingTop: "60px", minHeight: "100vh", background: "#070A14", position: "relative" }}>
        {/* Fondo decorativo */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse at 8% 0%, rgba(239,68,68,0.06) 0%, transparent 45%)",
        }} />
        <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "40px 32px", position: "relative", zIndex: 1 }}>
          {vistas[seccion] ?? <SeccionDashboard />}
        </div>
      </main>
    </>
  );
}