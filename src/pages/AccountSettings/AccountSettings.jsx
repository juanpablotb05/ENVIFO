import { useState, useRef, useEffect } from "react";
import "./AccountSettings.css";
import { NavbarL } from "../../components/NavbarL";

export default function AccountSettings() {
  // Estado inicial vacío para que se pueda poblar desde sessionStorage o fetch del backend
  const [usuario, setUsuario] = useState({
    id: null,
    nombre: "",
    email: "",
    rol: "",
    activo: false,
    ultimoAcceso: "",
    telefono: "",
    ubicacion: "",
    url: ""
  });

  const [fotoUrl, setFotoUrl] = useState("");
  const fileInputRef = useRef(null);

  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editFotoUrl, setEditFotoUrl] = useState("");
  const [editUbicacion, setEditUbicacion] = useState("");
  const [originalFoto, setOriginalFoto] = useState("");

  // Cargar foto y nombre desde sessionStorage (solo por sesión)
  const [profileType, setProfileType] = useState(null); // 'USUARIO' or 'EMPRESA'

  useEffect(() => {
    // Leer distintos keys posibles donde el front/back podría guardar el perfil
    const photo = sessionStorage.getItem("profilePhoto");
    if (photo) setFotoUrl(photo);

    // Intentar leer objeto de perfil en JSON en varias claves comunes
    const rawKeys = ["profile", "perfil", "userProfile", "profileData", "profileJson"];
    let parsed = null;
    for (const k of rawKeys) {
      const v = sessionStorage.getItem(k);
      if (v) {
        try { parsed = JSON.parse(v); break; } catch (e) { /* continuar */ }
      }
    }

    // Si no hay un JSON completo, leer valores separados
    const nombreSession = sessionStorage.getItem('nombre') || sessionStorage.getItem('profileName');
    const emailSession = sessionStorage.getItem('email') || sessionStorage.getItem('profileEmail');

    if (parsed) {
      // Mapear según estructura proporcionada por el usuario
      const tipo = (parsed.tipo || parsed.type || '').toUpperCase();
      setProfileType(tipo || null);

      if (tipo === 'USUARIO') {
        const primer = parsed.primerNombre || parsed.firstName || '';
        const primerA = parsed.primerApellido || parsed.firstSurname || '';
        const fullname = (primer + ' ' + primerA).trim() || nombreSession || '';
        setUsuario((u) => ({
          ...u,
          nombre: fullname,
          email: parsed.email || emailSession || u.email,
          rol: parsed.rol || (parsed.Permisos && parsed.Permisos.idPermiso ? 'RESTRINGIDO' : u.rol),
          telefono: parsed.celular || '',
          ubicacion: '', // dejar vacío, lo llenará la BD
          url: parsed.url || ''
        }));
      } else if (tipo === 'EMPRESA') {
        // Empresa: usar campos de empresa
        setUsuario((u) => ({
          ...u,
          nombre: parsed.nombre || nombreSession || u.nombre,
          email: parsed.email || emailSession || u.email,
          rol: parsed.rol || u.rol,
          telefono: parsed.telefono || parsed.telefono || u.telefono,
          ubicacion: parsed.direccion || u.ubicacion,
          url: parsed.url || ''
        }));
      } else {
        // fallback
        setUsuario((u) => ({ ...u, nombre: nombreSession || u.nombre, email: emailSession || u.email }));
      }

    } else {
      // No JSON profile; sólo usar claves simples si existen
      setUsuario((u) => ({ ...u, nombre: nombreSession || u.nombre, email: emailSession || u.email }));
    }

    // Inicializar campos de edición con valores de session/local
    setEditNombre(nombreSession || (parsed && (parsed.nombre || parsed.firstName)) || "");
    setEditTelefono(sessionStorage.getItem('telefono') || (parsed && (parsed.telefono || parsed.celular)) || "");
    setEditUrl(sessionStorage.getItem('profileUrl') || (parsed && parsed.url) || "");
    setEditFotoUrl(photo || "");
    setEditUbicacion(sessionStorage.getItem('ubicacion') || (parsed && (parsed.direccion || parsed.ubicacion)) || "");
  }, []);

  useEffect(() => {
    // Mantener editFotoUrl sincronizado con fotoUrl cuando no se está editando
    if (!isEditing) setEditFotoUrl(fotoUrl);
  }, [fotoUrl, isEditing]);

  const onFotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target.result;
        // Si estamos en modo edición, solo actualizar el campo de edición
        if (isEditing) {
          setEditFotoUrl(result);
        } else {
          // Fuera de edición, actualizar la foto activa y persistir en session
          setFotoUrl(result);
          try {
            sessionStorage.setItem("profilePhoto", result);
          } catch (err) {
            console.warn("No se pudo guardar la foto en sessionStorage", err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const quitarFoto = () => {
    if (isEditing) {
      // Durante edición, solo limpiar la foto temporal de edición
      setEditFotoUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      // Fuera de edición, limpiar la foto persistida
      setFotoUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      try {
        sessionStorage.removeItem("profilePhoto");
      } catch (err) {}
    }
  };

  const startEditing = () => {
    setEditNombre(usuario.nombre || "");
    setEditTelefono(usuario.telefono || "");
    setEditUrl(usuario.url || "");
    setEditFotoUrl(fotoUrl || "");
    setOriginalFoto(fotoUrl || "");
    setEditUbicacion(usuario.ubicacion || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    // Revertir cambios locales y restaurar foto temporal
    setEditNombre(usuario.nombre || "");
    setEditTelefono(usuario.telefono || "");
    setEditUrl(usuario.url || "");
    setEditFotoUrl(originalFoto || fotoUrl || "");
    setEditUbicacion(usuario.ubicacion || "");
    // limpiar input file
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsEditing(false);
  };

  const handleSave = () => {
    const token = sessionStorage.getItem('token');
    const idUsuario = sessionStorage.getItem('idUsuario');

    if (!token || !idUsuario) {
      alert('No se pudo obtener el token o ID de usuario. Por favor, inicia sesión de nuevo.');
      return;
    }

    // Validaciones simples
    if (!editNombre || editNombre.trim().length === 0) { alert('El nombre no puede estar vacío'); return; }
    if (editUrl && editUrl.trim().length > 0) {
      try { new URL(editUrl); } catch (e) { alert('URL inválida. Debe incluir http(s)://'); return; }
    }

    const payload = {
      nombre: editNombre,
      telefono: editTelefono,
      url: editUrl,
      ubicacion: editUbicacion,
      // Incluir la foto en base64 si está disponible
      fotoPerfil: editFotoUrl
    };

    fetch(`${import.meta.env.VITE_API_BASE}/user/${idUsuario}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        let data = null;
        if (contentType.includes('application/json')) data = await res.json();
        if (!res.ok) {
          const msg = (data && (data.message || data.error)) || `Error ${res.status}`;
          throw new Error(msg);
        }
        return data;
      })
      .then((data) => {
        // Si el backend devuelve el usuario actualizado, usarlo; si no, usar los valores locales
        const updated = data && data.usuario ? data.usuario : { ...usuario };
        updated.nombre = editNombre;
        updated.telefono = editTelefono;
        updated.url = editUrl;
        updated.ubicacion = editUbicacion;
        // Actualizar foto en sessionStorage
        try { if (editFotoUrl) sessionStorage.setItem('profilePhoto', editFotoUrl); } catch (e) {}

        setUsuario((u) => ({ ...u, nombre: updated.nombre, telefono: updated.telefono, url: updated.url, ubicacion: updated.ubicacion }));
        setFotoUrl(editFotoUrl || '');
        setIsEditing(false);

        // Guardar en sessionStorage los valores clave para persistencia de sesión
        try {
          sessionStorage.setItem('profileName', updated.nombre || '');
          sessionStorage.setItem('nombre', updated.nombre || '');
          if (updated.telefono) sessionStorage.setItem('telefono', updated.telefono);
          if (updated.url) sessionStorage.setItem('profileUrl', updated.url);
          if (updated.ubicacion) sessionStorage.setItem('ubicacion', updated.ubicacion);
        } catch (e) { }

        alert('Cambios guardados exitosamente ✅');
      })
      .catch((err) => {
        console.error('Error al guardar perfil:', err);
        alert('No se pudieron guardar los cambios: ' + (err.message || err));
      });
  };

  return (
    <NavbarL>
      <div className="perfil-container">
        {/* Encabezado */}
        <div className="perfil-header">
          <div className="perfil-header-content">
            <div className="perfil-user-info">
              {(isEditing ? (editFotoUrl || fotoUrl) : fotoUrl) ? (
                <img
                  src={isEditing ? (editFotoUrl || fotoUrl) : fotoUrl}
                  alt={(isEditing ? editNombre : usuario.nombre) ? `Foto de perfil de ${(isEditing ? editNombre : usuario.nombre)}` : 'Foto de perfil'}
                  className="perfil-avatar-lg"
                />
              ) : (
                <div className="perfil-avatar-placeholder-lg">
                  {((isEditing ? editNombre : usuario.nombre) && (isEditing ? editNombre : usuario.nombre).charAt(0).toUpperCase()) || 'A'}
                </div>
              )}
              <div>
                <h1 className="perfil-title">Perfil</h1>
                <p className="perfil-subtitle">
                  Información y acciones del perfil
                </p>
              </div>
            </div>
            <div>
              <span
                className={`perfil-status ${
                  usuario.activo ? "activo" : "inactivo"
                }`}
              >
                {usuario.activo ? "✅ Activo" : "❌ Inactivo"}
              </span>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="perfil-main">
          {/* Tarjeta de detalles del usuario */}
          <div className="perfil-card">
            <div className="perfil-user-summary">
              {(isEditing ? (editFotoUrl || fotoUrl) : fotoUrl) ? (
                <img
                  src={isEditing ? (editFotoUrl || fotoUrl) : fotoUrl}
                  alt={(isEditing ? editNombre : usuario.nombre) ? `Foto de perfil de ${(isEditing ? editNombre : usuario.nombre)}` : 'Foto de perfil'}
                  className="perfil-avatar-md"
                />
              ) : (
                <div className="perfil-avatar-placeholder-md">
                  {((isEditing ? editNombre : usuario.nombre) && (isEditing ? editNombre : usuario.nombre).charAt(0).toUpperCase()) || 'A'}
                </div>
              )}
              <div>
                {isEditing ? (
                  <input className="perfil-name-input" value={editNombre} onChange={(e)=>setEditNombre(e.target.value)} />
                ) : (
                  <h2 className="perfil-username">{usuario.nombre}</h2>
                )}
                <p className="perfil-email">{usuario.email}</p>
              </div>
            </div>
            <div className="perfil-actions">
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="btn-secondary"
              >
                CAMBIAR FOTO
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFotoChange}
                style={{ display: "none" }}
              />
              {fotoUrl && (
                <button className="btn-ghost" onClick={quitarFoto} style={{ marginLeft: 8 }}>QUITAR FOTO</button>
              )}
            </div>
            <div className="perfil-details">
              <div className="perfil-detail-row">
                <span>Rol</span>
                <span>
                  {usuario.rol}
                </span>
              </div>

              <div className="perfil-detail-row">
                <span>Teléfono</span>
                <span>
                  {isEditing ? (
                    <input value={editTelefono} onChange={(e)=>setEditTelefono(e.target.value)} placeholder="Teléfono" />
                  ) : (
                    usuario.telefono || <em>No definido</em>
                  )}
                </span>
              </div>

              <div className="perfil-detail-row">
                <span>Ubicación</span>
                <span>
                  {isEditing ? (
                    <input value={editUbicacion} onChange={(e)=>setEditUbicacion(e.target.value)} placeholder="Dirección / Ubicación" />
                  ) : (
                    usuario.ubicacion || <em>No definida</em>
                  )}
                </span>
              </div>

              <div className="perfil-detail-row">
                <span>URL</span>
                <span>
                  {isEditing ? (
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <input value={editUrl} onChange={(e)=>setEditUrl(e.target.value)} placeholder="https://..." style={{flex:1}} />
                    </div>
                  ) : (
                    usuario.url ? (
                      <a href={usuario.url} target="_blank" rel="noreferrer">{usuario.url}</a>
                    ) : (
                      <em>No definida</em>
                    )
                  )}
                </span>
              </div>

            </div>
            <div className="perfil-actions" style={{ marginTop: '1.5rem' }}>
              {!isEditing ? (
                <button onClick={startEditing} className="btn-primary">
                  EDITAR
                </button>
              ) : (
                <>
                  <button onClick={handleSave} className="btn-primary">Guardar</button>
                  <button onClick={cancelEditing} className="btn-ghost">Cancelar</button>
                </>
              )}

              <button className="btn-danger">
                EDITAR CONTRASEÑA
              </button>
            </div>
          </div>

        </div>
      </div>
    </NavbarL>
  );
}
