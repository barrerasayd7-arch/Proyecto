import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/StylePage/styleHome.css";

function Navbar({ onCerrarSesion }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const nombreUsuario = localStorage.getItem("usuario") || "Usuario";

  return (
    <nav className="navbar-custom">
      <div className="container">
        {/* Usamos Link para evitar recargas de página */}
        <Link to="/home" className="navbar-brand-custom">
          UniService
        </Link>

        {/* Botón hamburguesa para móvil */}
        <button
          className={`nav-toggle ${menuAbierto ? "active" : ""}`}
          onClick={() => setMenuAbierto((v) => !v)}
          aria-label="Menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-links ${menuAbierto ? "active" : ""}`}>
          <Link to="/home" className="nav-link-custom" onClick={() => setMenuAbierto(false)}>
            Inicio
          </Link>
          <Link to="/home#publicar" className="nav-link-custom" onClick={() => setMenuAbierto(false)}>
            Publicar servicio
          </Link>
          <Link to="/home#mis-servicios" className="nav-link-custom" onClick={() => setMenuAbierto(false)}>
            Mis servicios
          </Link>
          <Link to="/home#solicitudes" className="nav-link-custom" onClick={() => setMenuAbierto(false)}>
            Mis solicitudes
          </Link>
          <Link to="/home#soporte" className="nav-link-custom" onClick={() => setMenuAbierto(false)}>
            Soporte
          </Link>
          
          <Link to="/perfil" className="nav-link-custom nav-iniciar" onClick={() => setMenuAbierto(false)}>
            👤 {nombreUsuario}
          </Link>

          <button
            type="button"
            className="nav-Cerrar"
            onClick={() => {
                setMenuAbierto(false);
                onCerrarSesion();
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;