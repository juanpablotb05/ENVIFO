import React, { useState, useRef } from "react";
import "./AccountSettings.css";
import { NavbarL } from "../../components/NavbarL";
import { useNavigate } from "react-router-dom";

const AccountSettingsUsers = () => {
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
                  <p>No tienes permisos para ver la sección de Perfil de usuario.</p>
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
  const [usuario, setUsuario] = useState({
    id: sessionStorage.getItem("usuario") || null,
    nombre: sessionStorage.getItem("primerNombre") || "",
    segundoNombre: sessionStorage.getItem("segundoNombre") || "",
    primerApellido: sessionStorage.getItem("primerApellido") || "",
    segundoApellido: sessionStorage.getItem("segundoApellido") || "",
    email: sessionStorage.getItem("email") || "",
    telefono: sessionStorage.getItem("celular") || "",
    edad: sessionStorage.getItem("edad") || "",
    rol: sessionStorage.getItem("rol") || "",
  });

  const [formData, setFormData] = useState({
    primerNombre: usuario.nombre,
    segundoNombre: usuario.segundoNombre,
    primerApellido: usuario.primerApellido,
    segundoApellido: usuario.segundoApellido,
    email: usuario.email,
    telefono: usuario.telefono,
    edad: usuario.edad,
    password: "",
    confirmPassword: "",
  });

  const [image, setImage] = useState(sessionStorage.getItem("imagen") || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const fileInputRef = useRef(null);

  const [profilePhoto, setProfilePhoto] = useState(image);
  const [profileName, setProfileName] = useState(usuario.nombre);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!window.confirm("¿Está seguro que desea actualizar los cambios de su cuenta?")) return;

    if (passwordEnabled && formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const idUsuario = usuario.id;
    const token = sessionStorage.getItem("token");
    const formDataToSend = new FormData();

    const userData = {
      firstName: formData.primerNombre,
      middleName: formData.segundoNombre,
      firstSurname: formData.primerApellido,
      secondSurname: formData.segundoApellido,
      email: formData.email,
      phone: formData.telefono,
      age: formData.edad,
      ...(passwordEnabled && formData.password ? { password: formData.password } : {}),
    };

    formDataToSend.append("user", JSON.stringify(userData));

    if (selectedFile) {
      formDataToSend.append("file", selectedFile);
    }

    setIsUploading(true);

    try {
      const response = await fetch(
        `https://envifo-java-backend-api-rest.onrender.com/api/user/${idUsuario}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      alert("Datos actualizados correctamente.");

      // Actualizar sessionStorage
      sessionStorage.setItem("primerNombre", formData.primerNombre);
      sessionStorage.setItem("segundoNombre", formData.segundoNombre);
      sessionStorage.setItem("primerApellido", formData.primerApellido);
      sessionStorage.setItem("segundoApellido", formData.segundoApellido);
      sessionStorage.setItem("email", formData.email);
      sessionStorage.setItem("celular", formData.telefono);
      sessionStorage.setItem("edad", formData.edad);

      if (selectedFile) {
        sessionStorage.setItem("imagen", image);
        setProfilePhoto(image);
      }

      setProfileName(formData.primerNombre);
      setUsuario((prev) => ({ ...prev, ...formData }));
      setSelectedFile(null);

      if (passwordEnabled) {
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        setPasswordEnabled(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error al actualizar datos: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const quitarFoto = async () => {
    const idImagen = sessionStorage.getItem("idImagen");
    if (!idImagen) {
      alert("No hay imagen para eliminar.");
      return;
    }

    if (!window.confirm("¿Está seguro que desea eliminar la imagen?")) return;

    const token = sessionStorage.getItem("token");

    try {
      const response = await fetch(
        `https://envifo-java-backend-api-rest.onrender.com/api/user/imagen/${idImagen}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error(await response.text());

      setImage(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      sessionStorage.removeItem("imagen");
      sessionStorage.removeItem("idImagen");
      setProfilePhoto("");
      alert("Imagen eliminada correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la imagen: " + err.message);
    }
  };

  return (
    <NavbarL profilePhotoProp={profilePhoto} profileNameProp={profileName}>
      <div className="account-settings-container">
        <div className="sidebar">
          <div className="profile-section">
            <div className="profile-image-circle">
              {image ? (
                <img src={image} alt="Profile" className="profile-image" />
              ) : (
                <div className="no-image">Sin imagen</div>
              )}
            </div>
            <div className="file-upload-container">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <button
                className="file-select"
                onClick={(e) => {
                  e.preventDefault();
                  if (!selectedFile) fileInputRef.current.click();
                  else handleUpload();
                }}
                disabled={isUploading}
              >
                {isUploading
                  ? "Subiendo..."
                  : selectedFile
                  ? "Confirmar"
                  : image
                  ? "Cambiar"
                  : "Seleccionar"}
              </button>
              {image && (
                <button className="btn-ghost" onClick={quitarFoto}>
                  Quitar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="account-header">
            <h2>Cuenta</h2>
          </div>
          <form
            className="account-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleUpload();
            }}
          >
            <div className="form-group">
              <label htmlFor="primerNombre">Primer nombre</label>
              <input
                type="text"
                id="primerNombre"
                value={formData.primerNombre}
                onChange={handleChange}
                placeholder="Primer nombre"
              />
            </div>
            <div className="form-group">
              <label htmlFor="segundoNombre">Segundo nombre</label>
              <input
                type="text"
                id="segundoNombre"
                value={formData.segundoNombre}
                onChange={handleChange}
                placeholder="Segundo nombre"
              />
            </div>
            <div className="form-group">
              <label htmlFor="primerApellido">Primer apellido</label>
              <input
                type="text"
                id="primerApellido"
                value={formData.primerApellido}
                onChange={handleChange}
                placeholder="Primer apellido"
              />
            </div>
            <div className="form-group">
              <label htmlFor="segundoApellido">Segundo apellido</label>
              <input
                type="text"
                id="segundoApellido"
                value={formData.segundoApellido}
                onChange={handleChange}
                placeholder="Segundo apellido"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Correo electrónico"
              />
            </div>
            <div className="form-group">
              <label htmlFor="telefono">Celular</label>
              <input
                type="text"
                id="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Celular"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edad">Edad</label>
              <input
                type="text"
                id="edad"
                value={formData.edad}
                onChange={handleChange}
                placeholder="Edad"
              />
            </div>

            {!passwordEnabled && (
              <button
                type="button"
                className="change-password-btn"
                onClick={() => {
                  if (window.confirm("¿Está seguro que desea cambiar la contraseña?")) {
                    setPasswordEnabled(true);
                  }
                }}
              >
                Cambiar contraseña
              </button>
            )}

            {passwordEnabled && (
              <>
                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Ingrese nueva contraseña"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar contraseña</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repita la contraseña"
                  />
                </div>
              </>
            )}

            <button type="submit" className="update-button" disabled={isUploading}>
              {isUploading ? "Actualizando..." : "Actualizar cuenta"}
            </button>
          </form>
        </div>
      </div>
    </NavbarL>
  );
};

export default AccountSettingsUsers;
