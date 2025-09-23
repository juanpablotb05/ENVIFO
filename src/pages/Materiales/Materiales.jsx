import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Materiales.css";
import { NavbarL } from "../../components/NavbarL";

const API_URL = "https://envifo-java-backend-api-rest.onrender.com/api";

// Cabeceras con token
const authHeaders = () => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`,
});

export default function Materiales() {
  const navigate = useNavigate();

  // Leer permisos
  const vistaMateriales = sessionStorage.getItem("vistaMateriales") === "true";

  // Condición: se muestra el componente solo si vistaMateriales = true
  const puedeVer = vistaMateriales;

  if (!puedeVer) {
    return (
      <NavbarL>
        <div className="materiales-container" style={{ padding: 32 }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 24,
              maxWidth: 680,
              margin: "40px auto",
              textAlign: "center",
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            }}
          >
            <h2>🚫 Acceso denegado</h2>
            <p>No tienes permisos para ver la sección de Materiales.</p>
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
                  fontWeight: 600,
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

  // Estados
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Cargar materiales
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/materials/global`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Error al obtener materiales");
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  if (loading)
    return (
      <NavbarL>
        <div className="materiales-container">
          <p>Cargando materiales...</p>
        </div>
      </NavbarL>
    );

  return (
    <NavbarL>
      <div className="materiales-container">
        <h1>{selectedMaterial ? "Material" : "Materiales"}</h1>

        {/* Listado de materiales */}
        {!selectedMaterial && (
          <div className="materiales-grid">
            {materials.map((m) => (
              <div key={m.idMaterial} className="material-card">
                <img
                  src={m.material?.keyR2 || ""}
                  alt={m.nameMaterial}
                  className="material-image"
                />
                <div className="material-body">
                  <button
                    className="btn-orange"
                    onClick={() => setSelectedMaterial(m)}
                  >
                    Ver Detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detalle material */}
        {selectedMaterial && (
          <div className="material-detalle">
            <h2>{selectedMaterial.nameMaterial}</h2>
            <p>
              <b>Descripción:</b> {selectedMaterial.descripcionMate}
            </p>
            <p>
              <b>Dimensiones:</b> {selectedMaterial.height} x{" "}
              {selectedMaterial.width} cm
            </p>
            <p>
              <b>Estado:</b>{" "}
              {selectedMaterial.status ? "Disponible ✅" : "No disponible ❌"}
            </p>
            <p>
              <b>Categoría:</b> {selectedMaterial.nameCategory}
            </p>

            <h3>Imagen</h3>
            {selectedMaterial.material?.keyR2 ? (
              <img
                src={selectedMaterial.material.keyR2}
                alt={selectedMaterial.material.nameFile}
                className="detalle-imagen"
              />
            ) : (
              <p>No hay imagen disponible</p>
            )}

            <button
              className="btn-orange"
              onClick={() => setSelectedMaterial(null)}
            >
              Volver
            </button>
          </div>
        )}
      </div>
    </NavbarL>
  );
}
