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

// Utilidades para mapear respuestas del backend
const toLocal = (n) => ({
  id: n?.id ?? n?.idGrade ?? n?.idNota,
  title: n?.title ?? n?.titulo ?? '',
  body: n?.body ?? n?.content ?? n?.contenido ?? n?.nota ?? n?.text ?? '',
  createdAt: n?.createdAt || n?.fecha || new Date().toISOString(),
  updatedAt: n?.updatedAt || n?.fechaActualizacion || n?.fecha || new Date().toISOString(),
});

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const token = sessionStorage.getItem('token');
  const idUsuario = sessionStorage.getItem('idUsuario') || sessionStorage.getItem('usuario');
  const idCliente = sessionStorage.getItem('idCliente') || sessionStorage.getItem('cliente');

  // Lógica de fetch API
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
      setNotes(mapped);
      writeNotes(mapped);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes(readNotes());
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    const body = text.trim();
    const titulo = title.trim();
    if (!body) return;

    // Actualización optimista de la UI
    const temp = { id: Date.now().toString(36), title: titulo, body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setNotes((prev) => [temp, ...prev]);
    writeNotes([temp, ...notes]);
    setText('');
    setTitle('');

    if (!token) return;

    const payload = { title: titulo, content: body, idUsuario, idCliente };
    try {
      const res = await fetch(`${API_BASE}/grades/save`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al guardar la nota.');
      // Después de guardar, recargamos las notas para obtener la ID real de la API
      reloadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      // Opcional: revertir la actualización optimista si falla
    }
  };

  const saveEditedNote = async (id) => {
    const body = editText.trim();
    const titulo = editTitle.trim();
    if (!body) return;

    // Actualización optimista
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, title: titulo, body, updatedAt: new Date().toISOString() } : n)));
    writeNotes(notes.map((n) => (n.id === id ? { ...n, title: titulo, body, updatedAt: new Date().toISOString() } : n)));
    cancelEdit();

    if (!token) return;

    const payload = { idGrade: id, title: titulo, content: body, idUsuario };
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
      // Opcional: revertir la actualización optimista si falla
    }
  };

  const removeNote = async (id) => {
    if (!confirm('¿Eliminar nota?')) return;

    // Actualización optimista
    setNotes((prev) => prev.filter((n) => n.id !== id));
    writeNotes(notes.filter((n) => n.id !== id));

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
      // Opcional: revertir la actualización optimista si falla
    }
  };

  const searchNotes = async () => {
    const q = query.trim();
    if (!q) {
      reloadNotes();
      return;
    }

    if (token && idUsuario) {
      const url = `${API_BASE}/grades/filter/user/${encodeURIComponent(q)}/${idUsuario}`;
      fetchNotes(url);
    } else {
      setNotes(notes.filter((n) => (n.body || '').toLowerCase().includes(q) || (n.title || '').toLowerCase().includes(q)));
    }
  };

  const reloadNotes = () => {
    if (!token) {
      setNotes(readNotes());
      return;
    }
    const url = idUsuario ? `${API_BASE}/grades/user/${idUsuario}` : `${API_BASE}/grades/all`;
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
              onKeyDown={(e) => e.key === 'Enter' && searchNotes()}
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