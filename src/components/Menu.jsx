import { useState } from "react";
import { Link } from "react-router-dom";
import "./Menu.css";

export const Menu = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className={`layout ${isMenuOpen ? "menu-open" : ""}`}>
      {/* Botón Hamburguesa */}
      <button className="hamburger-btn" onClick={toggleMenu}>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Menú lateral */}
      <div className={`side-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="menu-header">
          <h2>Menu</h2>
          <button className="close-btn" onClick={closeMenu}>✖</button>
        </div>
        <div className="side">
          <a href="Dashboard" onClick={closeMenu}>📊 Dashboard</a>
          <a href="Users" onClick={closeMenu}>👥 Usuarios</a>
          <a href="#projects" onClick={closeMenu}>🗂️ Proyectos</a>
          <a href="#Materials" onClick={closeMenu}>📋 Materiales</a>
          <a href="#Settings" onClick={closeMenu}>⚙️ Configuración</a>
          <Link to="/Simulator" onClick={closeMenu}>🖥️ Simulador 3D</Link>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}

      {/* Contenido */}
      <main className="main-content">{children}</main>
    </div>
  );
};


