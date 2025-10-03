import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavbarL } from "../../components/NavbarL";


export default function Users() {
  const navigate = useNavigate();

  const rol = sessionStorage.getItem("rol");
  const editUsuarios = sessionStorage.getItem("editUsuarios") === "true";
  const vistaUsuarios = sessionStorage.getItem("vistaUsuarios") === "true";
  const idCliente = sessionStorage.getItem("usuario");

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

  const PERM_KEYS = [
    "editPermisos",
    "vistaUsuarios",
    "editUsuarios",
    "vistaProyectos",
    "editProyectos",
    "vistaDisenios3d",
    "editDisenios3d",
    "vistaMateriales",
    "editMateriales",
    "vistaInformes",
    "vistaCategorias",
    "editCategorias",
  ];

  const emptyPerms = PERM_KEYS.reduce((acc, k) => {
    acc[k] = false;
    return acc;
  }, {});

  const [assignedUsers, setAssignedUsers] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [roleData, setRoleData] = useState({
    idRol: null,
    name: "",
    description: "",
    permisos: { ...emptyPerms },
  });

  const fetchAssignedUsers = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        `https://envifo-java-backend-api-rest.onrender.com/api/roles/cliente/${idCliente}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setAssignedUsers(data);
    } catch (err) {
      console.error("Error al traer usuarios asignados:", err);
    }
  };

  const fetchUsuarios = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        "https://envifo-java-backend-api-rest.onrender.com/api/user/all",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error("Error al traer todos los usuarios:", err);
    }
  };

  useEffect(() => {
    fetchAssignedUsers();
    fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usuariosFiltrados = busqueda
    ? usuarios.filter(
        (usuario) =>
          usuario.email?.toLowerCase().includes(busqueda.toLowerCase()) &&
          !assignedUsers.some((asignado) => asignado.email === usuario.email)
      )
    : [];

  // 🔹 Seleccionar usuario (mostrar panel detalle)
  const handleSelectUser = (usuario) => {
    setSelectedUser(usuario);
  };

  // 🔹 Modal asignar rol (POST)
  const handleAssignClick = () => {
    if (!selectedUser) return;
    setRoleData({
      idRol: null,
      name: "",
      description: "",
      permisos: { ...emptyPerms },
    });
    setShowAssignModal(true);
  };

  // 🔹 Modal actualizar rol (PUT)
  const handleUpdateClick = (usuario) => {
    setSelectedUser(usuario);
    setRoleData({
      idRol: usuario.rol?.idRol,
      name: usuario.rol?.name || "",
      description: usuario.rol?.description || "",
      permisos: usuario.rol?.permisos || { ...emptyPerms },
    });
    setShowUpdateModal(true);
  };

  // 🔹 Eliminar rol
  const handleDeleteRole = async (usuario) => {
    const token = sessionStorage.getItem("token");
    const idRolAssigned = usuario.idRolAssigned;
    if (!idRolAssigned) {
      alert("No se encontró idRolAssigned para este usuario.");
      return;
    }
    if (!window.confirm(`¿Eliminar rol de ${usuario.firstName}?`)) return;

    try {
      const res = await fetch(
        `https://envifo-java-backend-api-rest.onrender.com/api/roles/${idRolAssigned}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error();
      alert("✅ Rol eliminado con éxito");
      fetchAssignedUsers();
    } catch (err) {
      console.error("Error al eliminar rol:", err);
      alert("❌ Error al eliminar rol");
    }
  };

  // Guardar rol (POST)
  const handleSaveAssign = async () => {
    if (!selectedUser) return;
    const token = sessionStorage.getItem("token");

    const permisosSinIds = Object.fromEntries(
      Object.entries(roleData.permisos).filter(([k]) => k !== "idPermiso")
    );

    const bodyObj = {
      name: roleData.name,
      description: roleData.description,
      permisos: permisosSinIds,
    };

    try {
      const res = await fetch(
        `https://envifo-java-backend-api-rest.onrender.com/api/roles/usuario/${selectedUser.idUsuario}/cliente/${idCliente}`,
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyObj),
        }
      );

      if (!res.ok) throw new Error();
      alert("✅ Rol asignado con éxito");
      setShowAssignModal(false);
      setSelectedUser(null); // 🔹 volvemos a la lista
      fetchAssignedUsers();
    } catch (err) {
      console.error("Error al asignar rol:", err);
      alert("❌ Error al asignar rol");
    }
  };

  // 🔹 Actualizar rol (PUT)
  const handleSaveUpdate = async () => {
    if (!selectedUser) return;
    const token = sessionStorage.getItem("token");

    const bodyObj = {
      idRol: roleData.idRol || selectedUser?.rol?.idRol,
      name: roleData.name,
      description: roleData.description,
      permisos: {
        idPermiso:
          roleData.permisos?.idPermiso ||
          selectedUser?.rol?.permisos?.idPermiso,
        ...roleData.permisos,
      },
    };

    try {
      const res = await fetch(
        `https://envifo-java-backend-api-rest.onrender.com/api/roles/usuario/${selectedUser.idUsuario}/cliente/${idCliente}`,
        {
          method: "PUT",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyObj),
        }
      );

      if (!res.ok) {
        const errorData = await res.text();
        console.error("Error backend:", errorData);
        throw new Error();
      }

      alert("✅ Rol actualizado con éxito");
      setShowUpdateModal(false);
      fetchAssignedUsers();
    } catch (err) {
      console.error("Error al actualizar rol:", err);
      alert("❌ Error al actualizar rol");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoleData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermisoChange = (permiso) => {
    setRoleData((prev) => ({
      ...prev,
      permisos: { ...prev.permisos, [permiso]: !prev.permisos[permiso] },
    }));
  };

  return (
    <NavbarL>
      <div className="panel-usuarios">
        <header className="header">
          <h1>👥 Panel de Usuarios</h1>
          <p>Gestión simple de usuarios</p>
        </header>

        {/* Usuarios asignados */}
        <section className="assigned-users">
          <h2>Usuarios asignados en la empresa</h2>
          <div className="assigned-list">
            {assignedUsers.map((u) => (
              <div key={u.idUsuario} className="assigned-item">
                <div>
                  {u.firstName} {u.firstSurname}
                </div>
                <div>{u.email}</div>
                <div>{u.rol?.name}</div>
                {editUsuarios && (
                  <div className="assigned-actions">
                    <button onClick={() => handleUpdateClick(u)}>
                      ✏️ Actualizar
                    </button>
                    <button onClick={() => handleDeleteRole(u)}>
                      🗑️ Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Buscador */}
        {!selectedUser && (
          <>
            <div className="buscador">
              <input
                type="text"
                placeholder="Buscar usuario por email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Resultados búsqueda */}
            {busqueda && (
              <div className="tabla-container">
                <table>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      {editUsuarios && <th>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.idUsuario}>
                        <td>
                          {usuario.firstName} {usuario.firstSurname}
                        </td>
                        <td>{usuario.email}</td>
                        {editUsuarios && (
                          <td>
                            <button onClick={() => handleSelectUser(usuario)}>
                              👁️ Seleccionar
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* 🔹 Panel detalle del usuario seleccionado */}
        {selectedUser && !showAssignModal && !showUpdateModal && (
          <div className="detalle-usuario">
            <h2>👤 Información del Usuario</h2>
            <ul>
              <li><strong>Nombre:</strong> {selectedUser.firstName} {selectedUser.middleName} {selectedUser.firstSurname} {selectedUser.secondSurname}</li>
              <li><strong>Edad:</strong> {selectedUser.age || "N/A"}</li>
              <li><strong>Email:</strong> {selectedUser.email}</li>
              <li><strong>Teléfono:</strong> {selectedUser.phone || "N/A"}</li>
              <li><strong>Estado:</strong> {selectedUser.state ? "Activo ✅" : "Inactivo ❌"}</li>
            </ul>
            <div className="detalle-actions">
              <button className="btn-primary" onClick={handleAssignClick}>
                ➕ Asignar Rol
              </button>
              <button className="btn-ghost" onClick={() => setSelectedUser(null)}>
                🔙 Volver
              </button>
            </div>
          </div>
        )}

        {/* Modal Asignar */}
        {showAssignModal && selectedUser && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Asignar Rol a {selectedUser.firstName}</h2>
              <input
                type="text"
                name="name"
                value={roleData.name}
                onChange={handleChange}
                placeholder="Nombre del rol"
              />
              <textarea
                name="description"
                value={roleData.description}
                onChange={handleChange}
                placeholder="Descripción"
              />
              <div className="permisos-grid">
                {Object.keys(roleData.permisos).map((permiso) => (
                  <label key={permiso}>
                    <input
                      type="checkbox"
                      checked={!!roleData.permisos[permiso]}
                      onChange={() => handlePermisoChange(permiso)}
                    />
                    {permiso}
                  </label>
                ))}
              </div>
              <button onClick={handleSaveAssign}>Guardar</button>
              <button onClick={() => setShowAssignModal(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Modal Actualizar */}
        {showUpdateModal && selectedUser && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Actualizar Rol de {selectedUser.firstName}</h2>
              <input
                type="text"
                name="name"
                value={roleData.name}
                onChange={handleChange}
                placeholder="Nombre del rol"
              />
              <textarea
                name="description"
                value={roleData.description}
                onChange={handleChange}
                placeholder="Descripción"
              />
              <div className="permisos-grid">
                {Object.keys(roleData.permisos)
                  .filter((p) => p !== "idPermiso")
                  .map((permiso) => (
                    <label key={permiso}>
                      <input
                        type="checkbox"
                        checked={!!roleData.permisos[permiso]}
                        onChange={() => handlePermisoChange(permiso)}
                      />
                      {permiso}
                    </label>
                  ))}
              </div>
              <button onClick={handleSaveUpdate}>Actualizar</button>
              <button onClick={() => setShowUpdateModal(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </NavbarL>
  );
}
