import React, { useEffect, useState } from 'react';
import { NavbarL } from '../../components/NavbarL';
import './Notes.css';

const STORAGE_KEY = 'quick_notes';
const API_BASE = (import.meta.env.VITE_API_BASE || 'https://envifo-java-backend-api-rest.onrender.com/api').replace(/\/+$/, '');

const readNotes = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const writeNotes = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
};

// Mapear respuesta del backend a formato local
const toLocal = (n) => ({
  id: n?.id ?? n?.idGrade ?? n?.idNota,
  title: n?.title ?? n?.titulo ?? '',
  body: n?.body ?? n?.content ?? n?.contenido ?? n?.nota ?? n?.text ?? '',
  createdAt:
    n?.createdAt ||
    n?.fechaCreacion ||
    n?.fecha ||
    new Date().toISOString(),
  updatedAt:
    n?.updatedAt ||
    n?.updatedDate ||
    n?.fechaActualizacion ||
    n?.fecha ||
    new Date().toISOString(),
});

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]); // 🔑 todas las notas originales
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const token = sessionStorage.getItem('token');
  const rol = sessionStorage.getItem('rol');
  const usuario = sessionStorage.getItem('usuario');

  const isGlobal = rol === 'GLOBAL';

  const sortByUpdated = (list) =>
    [...list].sort(
      (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );

  const fetchNotes = async (url) => {
    try {
      setLoading(true);
      const res = await fetch(url, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar las notas.');
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data?.items || data?.data || [];
      const mapped = (arr || []).map(toLocal).filter((n) => n.id && n.body);
      const ordered = sortByUpdated(mapped);
      setNotes(ordered);
      setAllNotes(ordered); // ✅ guardamos todas
      writeNotes(ordered);
    } catch (error) {
      console.error('Error fetching notes:', error);
      const fallback = sortByUpdated(readNotes());
      setNotes(fallback);
      setAllNotes(fallback);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    const body = text.trim();
    const titulo = title.trim();
    if (!body) return;

    const temp = {
      id: Date.now().toString(36),
      title: titulo,
      body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedList = sortByUpdated([temp, ...notes]);
    setNotes(updatedList);
    setAllNotes(updatedList); // ✅ también en allNotes
    writeNotes(updatedList);
    setText('');
    setTitle('');

    if (!token) return;

    const payload = isGlobal
      ? { title: titulo, content: body, idCustomer: usuario }
      : { title: titulo, content: body, idUser: usuario };

    try {
      const res = await fetch(`${API_BASE}/grades/save`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al guardar la nota.');
      reloadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const saveEditedNote = async (id) => {
    const body = editText.trim();
    const titulo = editTitle.trim();
    if (!body) return;

    const updatedList = notes.map((n) =>
      n.id === id ? { ...n, title: titulo, body, updatedAt: new Date().toISOString() } : n
    );
    setNotes(sortByUpdated(updatedList));
    setAllNotes(sortByUpdated(updatedList));
    writeNotes(sortByUpdated(updatedList));
    cancelEdit();

    if (!token) return;

    const payload = isGlobal
      ? { idGrade: id, title: titulo, content: body, idCustomer: usuario }
      : { idGrade: id, title: titulo, content: body, idUser: usuario };

    try {
      const res = await fetch(`${API_BASE}/grades/editGrade`, {
        method: 'PUT',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al actualizar la nota.');
      reloadNotes();
    } catch (error) {
      console.error('Error editing note:', error);
    }
  };

  const removeNote = async (id) => {
    if (!confirm('¿Eliminar nota?')) return;
    const updatedList = notes.filter((n) => n.id !== id);
    setNotes(sortByUpdated(updatedList));
    setAllNotes(sortByUpdated(updatedList));
    writeNotes(sortByUpdated(updatedList));

    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/grades/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al eliminar la nota.');
      reloadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const reloadNotes = () => {
    if (!token) {
      const local = sortByUpdated(readNotes());
      setNotes(local);
      setAllNotes(local);
      return;
    }
    const idCliente = usuario;
    const idUsuario = usuario;
    const url = isGlobal
      ? `${API_BASE}/grades/customer/${idCliente}`
      : `${API_BASE}/grades/user/${idUsuario}`;
    fetchNotes(url);
  };

  const startEdit = (n) => {
    setEditing(n.id);
    setEditText(n.body);
    setEditTitle(n.title || '');
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditText('');
    setEditTitle('');
  };

  // 🔎 Efecto que escucha query y filtra en vivo
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setNotes(allNotes); // si input vacío, mostrar todas
    } else {
      setNotes(
        sortByUpdated(
          allNotes.filter(
            (n) =>
              (n.body || '').toLowerCase().includes(q) ||
              (n.title || '').toLowerCase().includes(q)
          )
        )
      );
    }
  }, [query, allNotes]);

  useEffect(() => {
    reloadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NavbarL>
      <div className="notes-wrap">
        <header className="notes-header">
          <h1>📝 Notas</h1>
          <div className="notes-actions">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar nota..."
            />
          </div>
        </header>

        <section className="notes-new">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título (opcional)"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Escribe una nueva nota"
          />
          <div className="notes-buttons">
            <button className="btn-primary" onClick={addNote} disabled={!text.trim()}>
              Agregar
            </button>
            <button className="btn-ghost" onClick={() => { setText(''); setTitle(''); }}>
              Limpiar
            </button>
          </div>
        </section>

        <section className="notes-list">
          {loading ? <p className="muted">Cargando...</p> : null}
          {notes.length === 0 && !loading ? (
            <p className="muted">No hay notas</p>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="note-item">
                {editing === n.id ? (
                  <>
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Título" />
                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
                    <div className="row-actions">
                      <button className="action" onClick={() => saveEditedNote(n.id)}>
                        Guardar
                      </button>
                      <button className="action" onClick={cancelEdit}>
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {n.title && <div className="note-body" style={{ fontWeight: 600 }}>{n.title}</div>}
                    <div className="note-body">{n.body}</div>
                    <div className="note-meta">{new Date(n.updatedAt || n.createdAt).toLocaleString()}</div>
                    <div className="row-actions">
                      <button className="action" onClick={() => startEdit(n)}>
                        Editar
                      </button>
                      <button className="action danger" onClick={() => removeNote(n.id)}>
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </section>
      </div>
    </NavbarL>
  );
}
