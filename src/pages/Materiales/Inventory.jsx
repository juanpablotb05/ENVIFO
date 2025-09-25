import React, { useEffect, useRef, useState } from "react";
import "./Materiales.css";
import { NavbarL } from "../../components/NavbarL";
import { useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_BASE || "https://envifo-java-backend-api-rest.onrender.com/api").replace(/\/+$/, "");

const Inventory = () => {
  const navigate = useNavigate();
  // --- Permisos y rol desde sessionStorage
  const rol = sessionStorage.getItem("rol") || "";
  const editMateriales = sessionStorage.getItem("editMateriales") === "true";

  // --- Si no cumple condiciones, no renderiza
  if (!(rol === "GLOBAL" || editMateriales)) {
    return (
      <NavbarL>
        <div className="empresas-container" style={{ padding: 32 }}>
          <div style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 24,
            maxWidth: 680,
            margin: "40px auto",
            textAlign: "center",
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)"
          }}>
            <h2>🚫 Acceso denegado</h2>
            <p>No tienes permisos para ver la sección de Inventario.</p>
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => navigate("/Dashboard")}
                style={{
                  background: "#f97316",
                  color: "#fff",
                  border: "none",
                  padding: "10px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </NavbarL>
    );
  }

  // Estados para guardar materiales globales y del cliente
  const [globales, setGlobales] = useState([]);
  const [cliente, setCliente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef(null);

  const leerToken = () => (typeof window !== 'undefined' ? sessionStorage.getItem("token") : null);
  const leerIdCliente = () => {
    if (typeof window === 'undefined') return null;
    return (
      sessionStorage.getItem("idCliente") ||
      sessionStorage.getItem("cliente") ||
      sessionStorage.getItem("usuario") ||
      null
    );
  };

  const cargarListas = () => {
    const token = leerToken();
    const idCliente = leerIdCliente();

    if (!token || !idCliente) {
      console.error("No se encontró token o usuario en sesión");
      setLoading(false);
      return;
    }

    const fetchGlobales = fetch(`${API_BASE}/materials/global`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => (res.ok ? res.json() : []));

    const fetchCliente = fetch(`${API_BASE}/materials/client/${idCliente}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => (res.ok ? res.json() : []));

    Promise.all([fetchGlobales, fetchCliente])
      .then(([globalData, clienteData]) => {
        setGlobales(Array.isArray(globalData) ? globalData : globalData?.items || globalData?.data || []);
        setCliente(Array.isArray(clienteData) ? clienteData : clienteData?.items || clienteData?.data || []);
      })
      .catch((err) => {
        console.error("Error al cargar materiales:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarListas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subirMaterial = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const token = leerToken();
    const idCliente = leerIdCliente();
    if (!token || !idCliente) {
      alert("No hay sesión activa");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    try {
      setSubiendo(true);
      const form = new FormData();
      form.append("file", file);
      form.append("nombre", file.name);

      const resp = await fetch(`${API_BASE}/materials/client/${idCliente}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      await resp.json().catch(() => null);

      // Recargar lista del cliente tras subir
      const recarga = await fetch(`${API_BASE}/materials/client/${idCliente}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = recarga.ok ? await recarga.json() : [];
      const arr = Array.isArray(data) ? data : data?.items || data?.data || [];
      setCliente(arr || []);
      alert("Material subido correctamente");
    } catch (err) {
      console.error("No se pudo subir el material:", err);
      alert("No se pudo subir el material");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <NavbarL />
      <div className="materiales-container">
        <div className="hero">
          <h1>Materiales</h1>
          <p>Gestiona tus texturas y materiales</p>
        </div>

        {loading ? (
          <p>Cargando materiales...</p>
        ) : (
          <>
            {/* Sección de materiales globales */}
            <div className="card">
              <div className="card-header">
                <h2>Materiales globales</h2>
                <p>Disponibles para todos los clientes</p>
              </div>
              <div className="grid-global">
                {globales.length > 0 ? (
                  globales.map((mat) => (
                    <div key={mat.idMaterial || mat.id || mat.uuid} className="texture-item">
                      <div className="texture-preview">
                        {mat.previewUrl ? (
                          <img
                            src={mat.previewUrl}
                            alt={mat.nombre || "material"}
                            style={{ width: "100%", height: "100%" }}
                          />
                        ) : (
                          <div className="empty-state">Sin vista previa</div>
                        )}
                      </div>
                      <div className="texture-name">{mat.nombre || mat.name || "Sin nombre"}</div>
                    </div>
                  ))
                ) : (
                  <p>No hay materiales globales</p>
                )}
              </div>
            </div>

            {/* Sección de materiales del cliente */}
            <div className="card">
              <div className="card-header" style={{ gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h2>Mis materiales</h2>
                  <p>Texturas que subiste a tu cuenta</p>
                </div>
                <div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={subirMaterial}
                    className="hidden-input"
                  />
                  <button
                    className="btn-upload"
                    onClick={() => inputRef.current && inputRef.current.click()}
                    disabled={subiendo}
                  >
                    {subiendo ? "Subiendo..." : "Subir material"}
                  </button>
                </div>
              </div>
              <div className="grid-user">
                {cliente.length > 0 ? (
                  cliente.map((mat) => (
                    <div key={mat.idMaterial || mat.id || mat.uuid} className="user-texture">
                      <div className="user-texture-preview">
                        {mat.previewUrl ? (
                          <img
                            src={mat.previewUrl}
                            alt={mat.nombre || "material"}
                          />
                        ) : (
                          <div className="empty-state">Sin vista previa</div>
                        )}
                      </div>
                      <div className="user-texture-footer">
                        <span>{mat.nombre || mat.name || "Sin nombre"}</span>
                        <div className="user-actions">
                          <button className="btn-link">Editar</button>
                          <button className="btn-danger">Eliminar</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No has subido materiales aún</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Inventory;
