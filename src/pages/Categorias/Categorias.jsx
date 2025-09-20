import React, { useState, useEffect } from "react";
import { NavbarL } from "../../components/NavbarL";
import "./Categorias.css";

export default function Categories() {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  


  const genSlug = (v) =>
    v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slugPreview = genSlug(name || "");

  const resetForm = () => {
    setName("");
    setSuccess("");
    setError("");
  };

  // Crear categoría
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    const nombre = name.trim();
    if (!nombre) {
      setError("El nombre de la categoría es requerido");
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No hay token de autenticación en sesión. Por favor inicia sesión.");
      return;
    }

    const idCustomer = sessionStorage.getItem("usuario"); //  lo sacamos del login

    setSubmitting(true);

    fetch("https://envifo-java-backend-api-rest.onrender.com/api/categories/save", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
       body: JSON.stringify({
      nombre: nombre,
      section: "materiales",
      estado: true ,
      idCliente: idCustomer //  agregado para que tu backend lo reciba
    }),

    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al crear categoría");
        return res.json();
      })
      .then(() => {
        setSuccess("Categoría creada con éxito ✅");
        setName("");
        load("todas");
        
      })
      
      .catch((err) => {
        console.error("Error creando categoría:", err);
        setError("No se pudo crear la categoría");
      })
      .finally(() => setSubmitting(false));
  };

  // Listados
  const [activeTab, setActiveTab] = useState("todas");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const getId = (c) =>
    c?.id ?? c?.idCategoria ?? c?.idCategory ?? c?.idCat ?? null;
  const getName = (c) => c?.nombre ?? c?.name ?? "";

  const load = (tab = activeTab) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    const idCustomer = sessionStorage.getItem("usuario");

    let url = "https://envifo-java-backend-api-rest.onrender.com/api/categories/section/general";
    if (tab === "mias") {
      url = `https://envifo-java-backend-api-rest.onrender.com/api/categories/customer/${idCustomer}`;
    } else if (tab === "globales") {
      url = "https://envifo-java-backend-api-rest.onrender.com/api/categories/globals";
    }

    fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const arr = Array.isArray(data)
          ? data
          : data?.items || data?.data || [];
        setList(arr || []);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  // Edición
  const beginEdit = (cat) => {
  const id = getId(cat);
  if (id == null) return;
  setEditingId(id);
  setEditingName(getName(cat));
};

const cancelEdit = () => {
  setEditingId(null);
  setEditingName("");
};

const saveEdit = (id) => {
  const token = sessionStorage.getItem("token");
  const idCustomer = sessionStorage.getItem("usuario"); //  lo sacamos del login
  if (!token || !idCustomer) return;

  fetch("https://envifo-java-backend-api-rest.onrender.com/api/categories/update", {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      idCategoria: id,
      nombre: (editingName || "").trim(),
      section: "materiales",
      estado: true ,
      idCliente: idCustomer //  agregado para que tu backend lo reciba
    }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then(() => {
      setList((prev) =>
        prev.map((c) =>
          getId(c) === id ? { ...c, nombre: editingName } : c
        )
      );
      cancelEdit();
    })
    .catch((err) => console.error("Error editando categoría:", err));
};


  // Eliminar
 const removeCat = (id) => {
  if (!confirm("¿Eliminar categoría?")) return;
  const token = sessionStorage.getItem("token");
  if (!token) {
    console.error("❌ Error: No hay token de autenticación. Por favor inicia sesión.");
    return;
  }

  fetch(`https://envifo-java-backend-api-rest.onrender.com/api/categories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      // Si la respuesta no es exitosa (ej. 404, 500), lanzamos un error
      if (!res.ok) {
        if (res.status === 500) {
          // Si el error es 500, lanzamos un mensaje específico
          alert("❌ No se puede eliminar una categoria con materiales.");
        }
        // Para otros errores, lanzamos un mensaje genérico
        throw new Error("No se pudo eliminar la categoría. Respuesta del servidor no exitosa.");
      }
      return res;
    })
    .then(() => {
      // Este bloque solo se ejecuta si la respuesta fue exitosa
      setList((prev) => prev.filter((c) => getId(c) !== id));
      alert("✅ Categoría eliminada con éxito.");
    })
    .catch((err) => {
      // El catch ahora maneja todos los errores, tanto de red como los lanzados por el .then()
      console.error("Error eliminando categoría:", err.message);
    });
};

  useEffect(() => {
    load("todas");
  }, []);
  useEffect(() => {
    load(activeTab);
  }, [activeTab]);

  return (
    <NavbarL>
      <div className="categories-container">
        <header className="categories-header">
          <h1>📂 Crear categoría</h1>
          <p className="muted">
            Escribe el nombre. Te mostraremos un slug sugerido.
          </p>
        </header>

        <main className="categories-main">
          {success && (
            <div className="banner success" role="status">
              {success}
            </div>
          )}
          {error && (
            <div className="banner error" role="alert">
              {error}
            </div>
          )}

          <form className="category-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la categoría"
                aria-label="Nombre de la categoría"
              />
              <div className="input-help">
                {name ? (
                  <>Se creará como: <code>/{slugPreview}</code></>
                ) : (
                  "Ejemplo: Materiales"
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || !name.trim()}
              >
                {submitting ? "Creando..." : "Crear categoría"}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancelar
              </button>
            </div>
          </form>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === "todas" ? "active" : ""}`}
              onClick={() => setActiveTab("todas")}
            >
              Categorías existentes
            </button>
            <button
              className={`tab ${activeTab === "mias" ? "active" : ""}`}
              onClick={() => setActiveTab("mias")}
            >
              Mis categorías
            </button>
            <button
              className={`tab ${activeTab === "globales" ? "active" : ""}`}
              onClick={() => setActiveTab("globales")}
            >
              Categorías globales
            </button>
          </div>

          {/* Listado */}
          <div className="category-list" aria-busy={loading}>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th style={{ width: 140 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 && (
                  <tr>
                    <td colSpan={2}>No hay categorías para mostrar.</td>
                  </tr>
                )}
                {list.map((c) => {
                  const id = getId(c);
                  const canEdit = activeTab === "mias" && id != null;
                  return (
                    <tr key={id ?? getName(c)}>
                      <td>
                        {editingId === id ? (
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                          />
                        ) : (
                          getName(c)
                        )}
                      </td>
                      <td>
                        <div className="row-actions">
                          {canEdit ? (
                            editingId === id ? (
                              <>
                                <button
                                  className="action"
                                  onClick={() => saveEdit(id)}
                                >
                                  Guardar
                                </button>
                                <button
                                  className="action"
                                  onClick={cancelEdit}
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="action"
                                  onClick={() => beginEdit(c)}
                                >
                                  Editar
                                </button>
                                <button
                                  className="action danger"
                                  onClick={() => removeCat(id)}
                                >
                                  Eliminar
                                </button>
                              </>
                            )
                          ) : (
                            <span style={{ color: "#6b7280" }}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </NavbarL>
  );
}
