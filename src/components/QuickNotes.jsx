import React, { useEffect, useState } from "react";
import "./QuickNotes.css";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "quick_notes";
const API_BASE = (import.meta.env.VITE_API_BASE || "https://envifo-java-backend-api-rest.onrender.com/api").replace(/\/+$/, "");

function readNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeNotes(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export default function QuickNotes() {
  const [isLogged, setIsLogged] = useState(false);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [count, setCount] = useState(0);

  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");
  const rol = sessionStorage.getItem("rol");
  const usuario = sessionStorage.getItem("usuario");
  const isGlobal = rol === "GLOBAL";

  useEffect(() => {
    setIsLogged(!!token);
  }, [token]);

  useEffect(() => {
    if (isLogged) {
      setCount(readNotes().length);
    }
  }, [open, isLogged]);

  // 🚫 Si no hay token -> no renderiza nada
  if (!isLogged) return null;

  const addNote = async () => {
    const body = text.trim();
    if (!body) return;

    // 📌 Generar título con las primeras 3 palabras
    const words = body.split(/\s+/).slice(0, 3).join(" ");
    const title = words || "Nota rápida";

    const list = readNotes();
    const note = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      title,
      body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(note);
    writeNotes(list);
    setText("");
    setCount(list.length);

    if (!token) return;

    // 📌 Payload según rol
    const payload = isGlobal
      ? { title, content: body, idCustomer: usuario }
      : { title, content: body, idUser: usuario };

    try {
      const res = await fetch(`${API_BASE}/grades/save`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al guardar la nota rápida.");
    } catch (error) {
      console.error("Error saving quick note:", error);
    }
  };

  return (
    <>
      <button
        className="fqn-bubble"
        aria-label="Agregar nota rápida"
        onClick={() => setOpen(!open)}
      >
        📝
        {count > 0 ? (
          <span className="fqn-badge" aria-label={`${count} notas`}>
            {count}
          </span>
        ) : null}
      </button>

      {open && (
        <div className="fqn-modal" role="dialog" aria-modal="true">
          <div className="fqn-card">
            <div className="fqn-card-header">Nota rápida</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe una nota..."
              rows={4}
            />
            <div className="fqn-actions">
              <button
                className="fqn-btn"
                onClick={addNote}
                disabled={!text.trim()}
              >
                Guardar
              </button>
              <button
                className="fqn-btn"
                onClick={() => {
                  setOpen(false);
                  navigate("/Notes");
                }}
              >
                Ver notas
              </button>
              <button className="fqn-btn ghost" onClick={() => setOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
