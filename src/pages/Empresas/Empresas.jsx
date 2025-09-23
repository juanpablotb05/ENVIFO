import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoPlaceholder from "../../assets/Logo.jpeg"; // Imagen por defecto
import "./Empresas.css";
import { NavbarL } from "../../components/NavbarL";

const API_URL = "https://envifo-java-backend-api-rest.onrender.com/api";

//  Cabeceras con token (usar getItem por consistencia)
const authHeaders = () => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`,
});

export default function Empresas() {
  const navigate = useNavigate();

  // --- Leer permisos/rol desde sessionStorage (antes de renderizar o hacer fetch)
  const rol = sessionStorage.getItem("rol") || "";
  const editPermisos = sessionStorage.getItem("editPermisos") === "true";
  const vistaUsuarios = sessionStorage.getItem("vistaUsuarios") === "true";
  const editUsuarios = sessionStorage.getItem("editUsuarios") === "true";
  const editMateriales = sessionStorage.getItem("editMateriales") === "true";
  const vistaInformes = sessionStorage.getItem("vistaInformes") === "true";
  const editCategorias = sessionStorage.getItem("editCategorias") === "true";

  // --- Condición: si CUALQUIERA de estas es true, NO debe renderizar el componente
  const bloquearComponente =
    rol === "GLOBAL" ||
    editPermisos ||
    vistaUsuarios ||
    editUsuarios ||
    editMateriales ||
    vistaInformes ||
    editCategorias;

  // Si está bloqueado, mostramos mensaje simple (no se ejecutan fetchs)
  if (bloquearComponente) {
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
            <p>No tienes permisos para ver la sección de Empresas.</p>
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

  // --- Si NO está bloqueado, ejecutamos lógica normal
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);

  //  Cargar todas las empresas
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/customer/all`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Error al obtener empresas");
      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  //  Cargar empresa completa
  const fetchCompanyDetail = async (idCliente) => {
    try {
      const res = await fetch(`${API_URL}/customer/complete/${idCliente}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Error al obtener empresa");
      const data = await res.json();
      setSelectedCompany(data);
    } catch (err) {
      console.error(err);
    }
  };

  //  Cargar empresas al inicio
  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return (
    <NavbarL>
      <div className="empresas-container">
        <p>Cargando empresas...</p>
      </div>
    </NavbarL>
  );

  return (
    <NavbarL>
      <div className="empresas-container">
        {/* Condicional para cambiar título */}
        <h1>{selectedCompany ? "Empresa" : "Empresas"}</h1>

        {/*  Mostrar listado solo si NO hay empresa seleccionada */}
        {!selectedCompany && (
          <div className="empresas-grid">
            {companies.map((c) => (
              <div key={c.customerId} className="company-card">
                <img
                  src={c.images ? c.images.keyR2 : logoPlaceholder}
                  alt={c.name}
                  className="company-logo"
                />
                <div className="company-body">
                  <h3>{c.name}</h3>
                  <p>{c.email}</p>
                  <button
                    className="btn-orange"
                    onClick={() => fetchCompanyDetail(c.customerId)}
                  >
                    Ver Detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/*  Detalle empresa seleccionada */}
        {selectedCompany && (
          <div className="empresa-detalle">
            <h2>{selectedCompany.name}</h2>
            <p><b>Dirección:</b> {selectedCompany.address}</p>
            <p><b>Teléfono:</b> {selectedCompany.phone}</p>
            <p><b>Email:</b> {selectedCompany.email}</p>
            <p>
              <b>Web:</b>{" "}
              {selectedCompany.url ? (
                <a
                  href={selectedCompany.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedCompany.url}
                </a>
              ) : (
                "No disponible"
              )}
            </p>
            <p><b>Estado:</b> {selectedCompany.stateCustomer ? "Activo ✅" : "Inactivo ❌"}</p>

            {/* Imagen */}
            <h3>Imagen</h3>
            <div className="imagenes-grid">
              {selectedCompany.images ? (
                <div key={selectedCompany.images.idFile}>
                  <img
                    src={selectedCompany.images.keyR2}
                    alt={selectedCompany.images.nameFile}
                  />
                </div>
              ) : (
                <p>No hay imagen</p>
              )}
            </div>

            {/* Botón cerrar */}
            <button className="btn-orange" onClick={() => setSelectedCompany(null)}>Volver</button>
          </div>
        )}
      </div>
    </NavbarL>
  );
}
