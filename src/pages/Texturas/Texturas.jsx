import React, { useEffect, useRef, useState } from "react";
import "./Texturas.css";
import { NavbarL } from "../../components/NavbarL";

export default function Texturas() {
  const [globales, setGlobales] = useState([]);
  const [mias, setMias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef(null);

  // Recuperar token e idCliente desde sessionStorage
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  const idCliente =
    typeof window !== "undefined"
      ? sessionStorage.getItem("idCliente") ||
        sessionStorage.getItem("cliente") ||
        sessionStorage.getItem("usuario")
      : null;

  // Cargar texturas globales y del cliente
  const cargar = () => {
    if (!token || !idCliente) {
      setLoading(false);
      return;
    }

    const g = fetch(
      `https://envifo-java-backend-api-rest.onrender.com/api/textures/global`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then((r) => (r.ok ? r.json() : []));

    const c = fetch(
      `https://envifo-java-backend-api-rest.onrender.com/api/textures/client/${idCliente}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then((r) => (r.ok ? r.json() : []));

    Promise.all([g, c])
      .then(([gd, cd]) => {
        setGlobales(Array.isArray(gd) ? gd : []);
        setMias(Array.isArray(cd) ? cd : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subir nueva textura
  const subir = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!token || !idCliente) {
      alert("No hay sesión");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    try {
      setSubiendo(true);
      const form = new FormData();
      form.append("file", file);
      form.append("nombre", file.name);

      const r = await fetch(
        `https://envifo-java-backend-api-rest.onrender.com/api/textures/save`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );

      if (!r.ok) throw new Error(String(r.status));
      await r.json().catch(() => null);

      // Recargar mis texturas después de subir
      const rec = await fetch(
        `https://envifo-java-backend-api-rest.onrender.com/api/textures/client/${idCliente}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = rec.ok ? await rec.json() : [];
      setMias(Array.isArray(data) ? data : []);

      alert("Textura subida");
    } catch {
      alert("No se pudo subir la textura");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <NavbarL>
    <div className="texturas-wrap">
      <div className="hero">
        <h1>Texturas</h1>
        <p>Gestiona tus texturas: globales y personales</p>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <section className="card">
            <div className="card-header">
              <h2>Texturas globales</h2>
              <p>Disponibles para todos</p>
            </div>
            <div className="grid-global">
              {globales.length ? (
                globales.map((t) => (
                  <div
                    key={t.idTexture || t.id || t.uuid}
                    className="texture-item"
                  >
                    <div className="texture-preview">
                      {t.previewUrl ? (
                        <img
                          src={t.previewUrl}
                          alt={t.nombre || "textura"}
                          style={{ width: "100%", height: "100%" }}
                        />
                      ) : (
                        <div className="empty-state">Sin vista previa</div>
                      )}
                    </div>
                    <div className="texture-name">
                      {t.nombre || t.name || "Sin nombre"}
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay texturas globales</p>
              )}
            </div>
          </section>

          <section className="card">
            <div className="card-header" style={{ gap: 12, flexWrap: "wrap" }}>
              <div>
                <h2>Mis texturas</h2>
                <p>Texturas que subiste a tu cuenta</p>
              </div>
              <div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={subir}
                  className="hidden-input"
                />
                <button
                  className="btn-upload"
                  onClick={() =>
                    inputRef.current && inputRef.current.click()
                  }
                  disabled={subiendo}
                >
                  {subiendo ? "Subiendo..." : "Subir textura"}
                </button>
              </div>
            </div>
            <div className="grid-user">
              {mias.length ? (
                mias.map((t) => (
                  <div
                    key={t.idTexture || t.id || t.uuid}
                    className="user-texture"
                  >
                    <div className="user-texture-preview">
                      {t.previewUrl ? (
                        <img src={t.previewUrl} alt={t.nombre || "textura"} />
                      ) : (
                        <div className="empty-state">Sin vista previa</div>
                      )}
                    </div>
                    <div className="user-texture-footer">
                      <span>{t.nombre || t.name || "Sin nombre"}</span>
                      <div className="user-actions">
                        <button className="btn-link">Editar</button>
                        <button className="btn-danger">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No has subido texturas aún</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
    </NavbarL>
  );
}
