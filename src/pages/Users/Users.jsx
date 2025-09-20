import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Users.css"; // Importa estilos extra
import { NavbarL } from "../../components/NavbarL";

export default function Users() {
  const navigate = useNavigate();

  // Estado: usuarios asignados a la empresa (arriba) y lista completa (abajo)
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // 🔹 Llamar API para traer todos los usuarios
  const fetchUsuarios = async () => {
    try {
      console.log("Token usado:", sessionStorage.token); // 👀 para depuración

      const res = await fetch(
        "https://envifo-java-backend-api-rest.onrender.com/api/user/all",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: sessionStorage.token, // ✅ token directo
          },
        }
      );

      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      const data = await res.json();
      console.log("Usuarios recibidos:", data);

      setUsuarios(data);
    } catch (err) {
      console.error("Error al traer usuarios:", err);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // 🔍 Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Cambiar estado usuario (activo/inactivo)
  const cambiarEstado = (id) => {
    const usuarioActual = usuarios.find((u) => u.id === id);
    setUsuarios(
      usuarios.map((user) =>
        user.id === id ? { ...user, activo: !user.activo } : user
      )
    );
    alert(usuarioActual.activo ? "Usuario desactivado" : "Usuario activado");
  };

  // Eliminar usuario
  const eliminarUsuario = (id) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      setUsuarios(usuarios.filter((user) => user.id !== id));
      alert("Usuario eliminado");
    }
  };

  // Cambiar contraseña
  const cambiarContrasena = (id) => {
    const nuevaPassword = prompt("Nueva contraseña (mínimo 6 caracteres):");
    if (nuevaPassword && nuevaPassword.length >= 6) {
      alert("Contraseña cambiada exitosamente");
    } else if (nuevaPassword) {
      alert("La contraseña debe tener al menos 6 caracteres");
    }
  };

  // Cambiar rol
  const cambiarRol = (id, nuevoRol) => {
    setUsuarios(
      usuarios.map((user) =>
        user.id === id ? { ...user, rol: nuevoRol } : user
      )
    );
    alert(`Rol cambiado a ${nuevoRol}`);
  };

  return (
    <NavbarL>
      <div className="panel-usuarios">
        {/* Header */}
        <header className="header">
          <div>
            <h1>👥 Panel de Usuarios</h1>
            <p>Gestión simple de usuarios</p>
          </div>
        </header>

        {/* Usuarios asignados (arriba) */}
        <section className="assigned-users">
          <h2>Usuarios asignados</h2>
          <div className="assigned-list">
            {assignedUsers.length === 0 ? (
              <p>No hay usuarios asignados.</p>
            ) : (
              assignedUsers.map((u) => (
                <div key={u.id} className="assigned-item">
                  <div className="assigned-name">{u.nombre}</div>
                  <div className="assigned-email">{u.email}</div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Buscador */}
        <div className="buscador">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar usuarios"
          />
          <button className="btn-ghost" onClick={() => setBusqueda("")}>
            Limpiar
          </button>
        </div>

        {/* Tabla */}
        <div className="tabla-container">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Último Acceso</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="4">No hay usuarios.</td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="user-cell">
                        {usuario.nombre} <br />
                        <span className="user-email">{usuario.email}</span>
                      </td>
                      <td>{usuario.rol}</td>
                      <td>
                        <span
                          className={
                            usuario.activo ? "badge activo" : "badge inactivo"
                          }
                        >
                          {usuario.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>{usuario.ultimoAcceso}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {usuariosFiltrados.length === 0 && (
            <p className="empty">No se encontraron usuarios.</p>
          )}
        </div>
      </div>
    </NavbarL>
  );
}

