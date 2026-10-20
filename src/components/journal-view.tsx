"use client";

import { useState } from "react";
import { Download, FileHeart, LoaderCircle, Save, Trash2 } from "lucide-react";

import { useAppState } from "@/context/app-state";

export function JournalView() {
  const { actions, meta } = useAppState();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const save = () => {
    const cleanContent = content.trim();
    if (!cleanContent) return;
    actions.addJournalEntry({
      entryType: "free",
      title: title.trim() || "Una nota para mí",
      content: cleanContent,
    });
    setTitle("");
    setContent("");
  };

  const clearAll = async () => {
    const confirmed = window.confirm("¿Deseas borrar el progreso, las prácticas y todas las notas guardadas?");
    if (confirmed) await actions.clearData();
  };

  const loadOlder = async () => {
    setLoading(true);
    await actions.loadOlder();
    setLoading(false);
  };

  return (
    <div className="journal-layout">
      <aside className="surface-card journal-compose">
        <span className="eyebrow"><FileHeart size={15} /> Nota libre</span>
        <h2 style={{ fontSize: "2rem", color: "var(--etq-azul)" }}>Deja una huella</h2>
        <div className="field">
          <label htmlFor="journal-title">Título</label>
          <input id="journal-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Algo que deseo recordar" />
        </div>
        <div className="field">
          <label htmlFor="journal-content">Tu nota</label>
          <textarea id="journal-content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Escribe con libertad..." />
        </div>
        <button className="button button-primary" style={{ width: "100%", marginTop: 18 }} type="button" onClick={save} disabled={!content.trim()}>
          <Save size={17} /> Guardar en mi diario
        </button>
        <div className="button-row">
          <button className="button button-secondary" type="button" onClick={actions.exportData}><Download size={16} /> Exportar JSON</button>
          <button className="button button-danger" type="button" onClick={clearAll}><Trash2 size={16} /> Borrar datos</button>
        </div>
      </aside>

      <section>
        {meta.visibleJournalEntries.length === 0 ? (
          <div className="empty-state">
            <FileHeart size={32} style={{ marginBottom: 14 }} />
            <h3>Tu diario está listo para recibirte</h3>
            <p>Las notas libres, descubrimientos y pausas que guardes aparecerán aquí.</p>
          </div>
        ) : (
          <div className="journal-list">
            {meta.visibleJournalEntries.map((entry) => (
              <article className="journal-entry" key={entry.id}>
                <div className="journal-entry-header">
                  <div>
                    <span className="info-badge">{entry.entryType === "practice" ? "Pausa para soltar" : entry.entryType === "free" ? "Nota libre" : "Mi camino"}</span>
                    <h3 style={{ marginTop: 12 }}>{entry.title}</h3>
                    <time className="journal-date" dateTime={entry.createdAt}>
                      {new Intl.DateTimeFormat("es", { dateStyle: "long", timeStyle: "short" }).format(new Date(entry.createdAt))}
                    </time>
                  </div>
                  <button className="icon-button" type="button" aria-label={`Borrar ${entry.title}`} onClick={() => actions.deleteJournalEntry(entry.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="journal-entry-content">{entry.content}</p>
              </article>
            ))}
            {meta.hasMoreJournalEntries ? (
              <button className="button button-secondary" type="button" onClick={loadOlder} disabled={loading}>
                {loading ? <LoaderCircle size={17} /> : null} Cargar anteriores
              </button>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
