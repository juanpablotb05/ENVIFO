import React, { useEffect, useState } from 'react';
import './QuickNotes.css';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'quick_notes';

function readNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeNotes(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

export default function QuickNotes() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setCount(readNotes().length);
  }, [open]);

  const addNote = () => {
    const body = text.trim();
    if (!body) return;
    const list = readNotes();
    const note = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,8),
      body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(note);
    writeNotes(list);
    setText('');
    setCount(list.length);
  };

  return (
    <>
      <button
        className="fqn-bubble"
        aria-label="Agregar nota rápida"
        onClick={() => setOpen(!open)}
      >
        📝{count > 0 ? <span className="fqn-badge" aria-label={`${count} notas`}>{count}</span> : null}
      </button>

      {open && (
        <div className="fqn-modal" role="dialog" aria-modal="true">
          <div className="fqn-card">
            <div className="fqn-card-header">Nota rápida</div>
            <textarea
              value={text}
              onChange={(e)=>setText(e.target.value)}
              placeholder="Escribe una nota..."
              rows={4}
            />
            <div className="fqn-actions">
              <button className="fqn-btn" onClick={addNote} disabled={!text.trim()}>Guardar</button>
              <button className="fqn-btn" onClick={() => { setOpen(false); navigate('/Notes'); }}>Ver notas</button>
              <button className="fqn-btn ghost" onClick={() => setOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
