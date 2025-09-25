import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Users.css"; 
import { NavbarL } from "../../components/NavbarL";

export default function Users() {
  const navigate = useNavigate();

  const rol = sessionStorage.getItem("rol");
  const editUsuarios = sessionStorage.getItem("editUsuarios") === "true";
  const vistaUsuarios = sessionStorage.getItem("vistaUsuarios") === "true";

  // 🔹 Verificación de permisos: si no cumple, no renderiza nada
  if (!(rol === "GLOBAL" || editUsuarios || vistaUsuarios)) {
    return (
      <NavbarL>
        <div className="no-access">
          <h2>🚫 Acceso denegado</h2>
          <p>No tienes permisos para ver esta sección.</p>
        </div>
      </NavbarL>
    );
  }

  const [assignedUsers, setAssignedUsers] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(
        "https://envifo-java-backend-api-rest.onrender.com/api/user/all",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: sessionStorage.token,
          },
        }
      );

      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error("Error al traer usuarios:", err);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <NavbarL>
      <div className="panel-usuarios">
        <header className="header">
          <div>
            <h1>👥 Panel de Usuarios</h1>
            <p>Gestión simple de usuarios</p>
          </div>
        </header>

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

        <div className="buscador">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className="btn-ghost" onClick={() => setBusqueda("")}>
            Limpiar
          </button>
        </div>

        <div className="tabla-container">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Último Acceso</th>
                  {editUsuarios && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={editUsuarios ? "5" : "4"}>No hay usuarios.</td>
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
                      {editUsuarios && (
                        <td>
                          <button
                            className="btn-edit"
                            onClick={() =>
                              navigate(`/users/edit/${usuario.id}`)
                            }
                          >
                            ✏️ Editar
                          </button>
                        </td>
                      )}
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
