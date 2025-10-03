import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./NavbarL.css";

export function NavbarL({ children, profilePhotoProp, profileNameProp }) {
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profileName, setProfileName] = useState("A");
  const [permiso, setPermiso] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // menú de perfil
  const [isMenuOpen, setIsMenuOpen] = useState(false); // menú lateral
  const [vista, setVista] = useState("dashboard");

  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Cargar datos de perfil directamente de sessionStorage o props
  useEffect(() => {
    const photo = profilePhotoProp || sessionStorage.getItem("imagen") || "";
    const name =
      profileNameProp ||
      sessionStorage.getItem("primerNombre") ||
      sessionStorage.getItem("nombre") ||
      sessionStorage.getItem("userName") ||
      "A";
    const rol = sessionStorage.getItem("rol") || "";
    const tipo = sessionStorage.getItem("tipo") || "";

    setProfilePhoto(photo);
    setProfileName(name);
    setPermiso(rol || tipo);
  }, [profilePhotoProp, profileNameProp]);

  // 🔹 Cierra menú de perfil si clic afuera
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // 🔹 Actualiza título según la ruta
  useEffect(() => {
    const path = (location.pathname || "").toLowerCase();
    if (path.includes("/Users")) setVista("Users");
    else if (path.includes("/accountsettings")) setVista("AccountSettings");
    else if (path.includes("/simulator")) setVista("Simulador");
    else if (path.includes("/materiales")) setVista("Materiales");
    else if (path.includes("/empresas")) setVista("Empresas");
    else if (path.includes("/categories")) setVista("Categorias");
    else if (path.includes("/notes")) setVista("Notas");
    else if (path.includes("/maps")) setVista("Maps");
    else if (path.includes("/dashboard")) setVista("dashboard");
    else if (path.includes("/userprofile")) setVista("UserProfile");
    else if (path.includes("/Inventory")) setVista("Inventory");
    else if (path.includes("/Users")) setVista("Users");
    else if (path === "/" || path === "") setVista("home");
    else setVista("dashboard");
  }, [location]);

  // 🔹 Título dinámico
  const tituloSegunVista = () => {
    const v = (vista || "").toLowerCase();
    if (v === "Users") return "Panel de Usuarios";
    if (v === "proyectos") return "Proyectos";
    if (v === "accountsettings") return "Configuración de la cuenta";
    if (v === "simulador") return "Simulador 3D";
    if (v === "materiales") return "Materiales";
    if (v === "empresas") return "Empresas";
    if (v === "categorias") return "Categorías";
    if (v === "notas") return "Notas";
    if (v === "maps") return "Mapas";
    if (v === "userprofile") return "Perfil de Usuario";
    if (v === "home") return "Inicio";
    if (v === "Inventory") return "Inventory";
    return "Dashboard";
  };

  return (
    <div className={`layout ${isMenuOpen ? "menu-open" : ""}`}>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="navbar-container">
          {/* Botón hamburguesa */}
          <button
            aria-label="Abrir menú"
            className="menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="menu-line" />
            <span className="menu-line" />
            <span className="menu-line" />
          </button>

          {/* Título */}
          <h1 className="navbar-title">{tituloSegunVista()}</h1>

          {/* Perfil */}
          <div className="profile-container" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="profile-btn"
              aria-label="Abrir menú de perfil"
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={profileName}
                  className="profile-img"
                />
              ) : (
                <div className="profile-placeholder">
                  {profileName ? profileName.charAt(0).toUpperCase() : "A"}
                </div>
              )}
              <span className="profile-label">{profileName}</span>
            </button>

            {menuOpen && (
              <div className="profile-menu">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    const rol = sessionStorage.getItem("rol") || "";
                    if (rol === "GLOBAL") {
                      navigate("/AccountSettings");
                    } else {
                      navigate("/AccountSettingsUsers");
                    }
                  }}
                  className="profile-menu-item"
                >
                  ✏️ Editar perfil
                </button>

                <button
                  onClick={() => {
                    sessionStorage.clear();
                    localStorage.clear();
                    console.clear();
                    setMenuOpen(false);
                    navigate("/");
                  }}
                  className="profile-menu-item"
                >
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MENÚ LATERAL */}
      <div className={`side-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="menu-header">
          <h2>Menú</h2>
          <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
            ✖
          </button>
        </div>
        <div className="side">
          <Link to="/Dashboard" onClick={() => setIsMenuOpen(false)}>
            📊 Dashboard
          </Link>
          <Link to="/Simulator" onClick={() => setIsMenuOpen(false)}>
            🖥️ Simulador 3D
          </Link>
          {permiso === "GLOBAL" && (
            <Link to="/Users" onClick={() => setIsMenuOpen(false)}>
              👥 Usuarios
            </Link>
          )}

          {permiso !== "GLOBAL" && (
            <Link to="/Empresas" onClick={() => setIsMenuOpen(false)}>
              🏢 Empresas
            </Link>
          )}

          {permiso === "GLOBAL" ||
          sessionStorage.getItem("editMateriales") === "true" ? (
            <Link to="/Inventory" onClick={() => setIsMenuOpen(false)}>
              📋 Inventario
            </Link>
          ) : (
            <Link to="/Materiales" onClick={() => setIsMenuOpen(false)}>
              📋 Materiales
            </Link>
          )}

          {permiso === "GLOBAL" && (
            <Link to="/Categories" onClick={() => setIsMenuOpen(false)}>
              📂 Categorías
            </Link>
          )}
          <Link to="/Notes" onClick={() => setIsMenuOpen(false)}>
            📝 Notas
          </Link>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">{children}</main>
    </div>
  );
}
