import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./NavbarL.css";

export function NavbarL({ children }) {
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profileName, setProfileName] = useState("A");
  const [permiso, setPermiso] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // menú de perfil
  const [isMenuOpen, setIsMenuOpen] = useState(false); // menú lateral
  const [vista, setVista] = useState("dashboard");

  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Obtener datos de perfil únicamente desde la API (si hay token).
  // 🔹 Ya no se usa localStorage; solo se utiliza sessionStorage temporal y el endpoint /me.
  useEffect(() => {
    // Valores iniciales desde sessionStorage únicamente
    const photo = sessionStorage.getItem("profilePhoto") || "";
    const name = sessionStorage.getItem("nombre") || sessionStorage.getItem("profileName") || "A";
    const storedPerm = sessionStorage.getItem("permiso") || null;

    setProfilePhoto(photo);
    setProfileName(name);
    setPermiso(storedPerm);

    const token = sessionStorage.getItem("token") || null;
    if (!token) return; // sin token no intentamos llamar a la API

    let mounted = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // Usar fetch con then/catch para seguir el patrón del login proporcionado
    const base = "https://envifo-java-backend-api-rest.onrender.com/api";

    fetch(`${base.replace(/\/+$/, "")}/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    })
      .then((res) => {
        clearTimeout(timeout);
        if (!res.ok) {
          console.warn('No se pudo obtener perfil desde la API:', res.status);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!mounted || !data) return;
        const permFromApi = data.permiso || data.role || data.roles || data.idPermiso || data.permission || data.permissionLevel || null;
        const nombreFromApi = data.name || data.nombre || data.firstName || data.username || data.email || null;
        const photoFromApi = data.photo || data.profilePhoto || data.avatar || null;

        if (permFromApi) {
          setPermiso(permFromApi);
          try { sessionStorage.setItem('permiso', permFromApi); } catch (e) {}
        }
        if (nombreFromApi) {
          setProfileName(nombreFromApi);
          try { sessionStorage.setItem('nombre', nombreFromApi); } catch (e) {}
        }
        if (photoFromApi) {
          setProfilePhoto(photoFromApi);
          try { sessionStorage.setItem('profilePhoto', photoFromApi); } catch (e) {}
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') console.warn('Solicitud para obtener perfil abortada');
        else console.warn('Error al obtener perfil desde API:', err);
      });

    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  // 🔹 Cierra menú de perfil si clic afuera
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // 🔹 Actualiza título según la ruta
  useEffect(() => {
    const path = (location.pathname || "").toLowerCase();
    if (path.includes("/users")) setVista("Users");
    else if (path.includes("/accountsettings")) setVista("AccountSettings");
    else if (path.includes("/simulator")) setVista("Simulador");
    else if (path.includes("/materiales")) setVista("Materiales");
    else if (path.includes("/empresas")) setVista("Empresas");
    else if (path.includes("/categories")) setVista("Categorias");
    else if (path.includes("/notes")) setVista("Notas");
    else if (path.includes("/maps")) setVista("Maps");
    else if (path.includes("/dashboard")) setVista("dashboard");
    else if (path.includes("/userprofile")) setVista("UserProfile");
    else if (path === "/" || path === "") setVista("home");
    else setVista("dashboard");
  }, [location]);

  // 🔹 Título dinámico
  const tituloSegunVista = () => {
    const v = (vista || "").toLowerCase();
    if (v === "users") return "Panel de Usuarios";
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
                <img src={profilePhoto} alt={profileName} className="profile-img" />
              ) : (
                <div className="profile-placeholder">
                  {profileName ? profileName.charAt(0).toUpperCase() : "A"}
                </div>
              )}
            </button>

            {menuOpen && (
              <div className="profile-menu">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/AccountSettings");
                  }}
                  className="profile-menu-item"
                >
                  ✏️ Editar perfil
                </button>
                <button
                  onClick={() => {
                    sessionStorage.clear();
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
          <Link to="/Dashboard" onClick={() => setIsMenuOpen(false)}>📊 Dashboard</Link>
          <Link to="/Simulator" onClick={() => setIsMenuOpen(false)}>🖥️ Simulador 3D</Link>
          {/* Mostrar enlace 'Usuarios' (visible para todos) */}
          <Link to="/Users" onClick={() => setIsMenuOpen(false)}>👥 Usuarios</Link>
          <Link to="/Empresas" onClick={() => setIsMenuOpen(false)}>🏢 Empresas</Link>
          <a href="#projects" onClick={() => setVista("proyectos")}>🗂️ Proyectos</a>
          <Link to="/Materiales" onClick={() => setIsMenuOpen(false)}>📋 Materiales</Link>
          <Link to="/Texturas" onClick={() => setIsMenuOpen(false)}>🧩 Texturas</Link>
          <Link to="/Categories" onClick={() => setIsMenuOpen(false)}>📂 Categorías</Link>
          <Link to="/Notes" onClick={() => setIsMenuOpen(false)}>📝 Notas</Link>
          
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />}

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">{children}</main>
    </div>
  );
}
