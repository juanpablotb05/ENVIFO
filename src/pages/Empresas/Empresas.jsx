import React, { useEffect, useState } from "react";
import logoPlaceholder from "../../assets/Logo.jpeg"; // Imagen por defecto
import "./Empresas.css";
import { NavbarL } from "../../components/NavbarL";

const API_URL = "https://envifo-java-backend-api-rest.onrender.com/api";

//  Cabeceras con token
const authHeaders = () => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.token || ""}`,
});

export default function Empresas() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null); // Empresa seleccionada
  const [imageFile, setImageFile] = useState(null);

  //  Cargar todas las empresas
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/customer/all`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Error al obtener empresas");
      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  //  Cargar empresa con imágenes
  const fetchCompanyDetail = async (idCliente) => {
    try {
      const res = await fetch(`${API_URL}/complete/${idCliente}`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Error al obtener empresa con imágenes");
      const data = await res.json();

      
      setSelectedCompany(data);
    } catch (err) {
      console.error(err);
    }
  };

  //  Eliminar empresa
  const deleteCompany = async (idCliente) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta empresa?")) return;
    try {
      const res = await fetch(`${API_URL}/${idCliente}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Error al eliminar empresa");
      await fetchCompanies();
      setSelectedCompany(null);
      alert("Empresa eliminada ❌");
    } catch (err) {
      console.error(err);
    }
  };

  //  Subir imagen
  const uploadImage = async (idCliente) => {
    if (!imageFile) return alert("Selecciona una imagen primero");
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const res = await fetch(`${API_URL}/save/imagen/${idCliente}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionStorage.token || ""}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Error al subir imagen");
      await fetchCompanyDetail(idCliente);
      alert("Imagen subida ✅");
      setImageFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  //  Eliminar imagen
  const deleteImage = async (idImagen, idCliente) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta imagen?")) return;
    try {
      const res = await fetch(`${API_URL}/imagen/${idImagen}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Error al eliminar imagen");
      await fetchCompanyDetail(idCliente);
      alert("Imagen eliminada ❌");
    } catch (err) {
      console.error(err);
    }
  };

  //  Cargar empresas al inicio
  useEffect(() => {
    fetchCompanies();
  }, []);

  if (loading) return <p>Cargando empresas...</p>;

  return (
    <NavbarL>
    <div className="empresas-container">
      <h1>Empresas</h1>

      {/*  Listado de empresas */}
      <div className="empresas-grid">
        {companies.map((c) => (
          <div key={c.id} className="company-card">
            <img src={logoPlaceholder} alt="logo" className="company-logo" />
            <h3>{c.name}</h3>
            <p>{c.email}</p>
            <button onClick={() => fetchCompanyDetail(c.id)}>Ver Detalle</button>
          </div>
        ))}
      </div>

      {/*  Detalle empresa seleccionada */}
      {selectedCompany && (
        <div className="empresa-detalle">
          <h2>{selectedCompany.name}</h2>
          <p>{selectedCompany.address}</p>
          <p>{selectedCompany.phone}</p>
          <p>{selectedCompany.email}</p>

          {/* Imagenes */}
          <h3>Imágenes</h3>
          <div className="imagenes-grid">
            {selectedCompany.imagenes && selectedCompany.imagenes.length > 0 ? (
              selectedCompany.imagenes.map((img) => (
                <div key={img.id}>
                  <img src={`data:image/jpeg;base64,${img.data}`} alt="empresa" />
                  <button onClick={() => deleteImage(img.id, selectedCompany.id)}>Eliminar</button>
                </div>
              ))
            ) : (
              <p>No hay imágenes</p>
            )}
          </div>

          {/* Subir nueva imagen */}
          <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />
          <button onClick={() => uploadImage(selectedCompany.id)}>Subir Imagen</button>

          {/* Acciones */}
          <button onClick={() => deleteCompany(selectedCompany.id)}>Eliminar Empresa</button>
          <button onClick={() => setSelectedCompany(null)}>Cerrar</button>
        </div>
      )}
    </div>
    </NavbarL>
  );
}
