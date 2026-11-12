"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileHeart, LoaderCircle, Save, Trash2 } from "lucide-react";

import { useAppState } from "@/context/app-state";
import { journalDraftKey, parseJournalDraft } from "@/lib/draft-storage";

export function JournalView() {
  const { actions, meta, state } = useAppState();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadedDraftKey, setLoadedDraftKey] = useState<string | null>(null);
  const draftKey = useMemo(
    () => journalDraftKey(state.user?.id),
    [state.user?.id],
  );

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const stored = parseJournalDraft(window.localStorage.getItem(draftKey));
      setTitle(stored.title);
      setContent(stored.content);
      setLoadedDraftKey(draftKey);
    });
    return () => {
      active = false;
    };
  }, [draftKey]);

  useEffect(() => {
    if (loadedDraftKey !== draftKey) return;
    if (title || content) window.localStorage.setItem(draftKey, JSON.stringify({ title, content }));
    else window.localStorage.removeItem(draftKey);
  }, [content, draftKey, loadedDraftKey, title]);

  useEffect(() => {
    if (!title.trim() && !content.trim()) return;
    const protectDraft = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", protectDraft);
    return () => window.removeEventListener("beforeunload", protectDraft);
  }, [content, title]);

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
    window.localStorage.removeItem(draftKey);
  };

  const clearAll = async () => {
    const confirmation = window.prompt(
      "Esta acción borrará el progreso, las prácticas, las evaluaciones y todas las notas de esta cuenta. No se puede deshacer. Escribe BORRAR para confirmar.",
    );
    if (confirmation === "BORRAR") await actions.clearData();
  };

  const deleteEntry = (id: string, entryTitle: string) => {
    if (window.confirm(`¿Borrar “${entryTitle}”? Esta nota no podrá recuperarse.`)) {
      actions.deleteJournalEntry(id);
    }
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
        <h2 style={{ fontSize: "2rem", color: "var(--etq-azul)" }}>Escribe solo si te ayuda</h2>
        <p className="helper-text">Puedes empezar con «Hoy me siento...» o «Quiero recordar...». Después pulsa «Conservar en Mi diario» para leer tu nota en la lista.</p>
        <div className="field">
          <label htmlFor="journal-title">Título (opcional)</label>
          <input id="journal-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Algo que deseo recordar" />
        </div>
        <div className="field">
          <label htmlFor="journal-content">Tu nota</label>
          <textarea id="journal-content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Hoy me siento... / Quiero recordar..." />
        </div>
        <button className="button button-primary" style={{ width: "100%", marginTop: 18 }} type="button" onClick={save} disabled={!content.trim()}>
          <Save size={17} /> Conservar en Mi diario
        </button>
        {title.trim() || content.trim() ? <p className="draft-status">Borrador guardado en este dispositivo</p> : null}
        <div className="button-row">
          <button className="button button-secondary" type="button" onClick={actions.exportData}><Download size={16} /> Descargar una copia de mi diario</button>
          <button className="button button-danger" type="button" onClick={clearAll}><Trash2 size={16} /> Borrar todos mis datos</button>
        </div>
        <p className="helper-text">Al pulsar «Descargar», se guardará un archivo con tus notas en este dispositivo. El formato se llama JSON. También puedes seguir leyendo tus notas aquí.</p>
      </aside>

      <section>
        {meta.visibleJournalEntries.length === 0 ? (
          <div className="empty-state">
            <FileHeart size={32} style={{ marginBottom: 14 }} />
            <h3>Aquí aparecerán tus notas</h3>
            <p>Cuando escribas una nota y pulses «Conservar en Mi diario», podrás leerla aquí. También aparecerán las pausas que conserves desde «Soltar ahora».</p>
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
                  <button className="icon-button" type="button" aria-label={`Borrar ${entry.title}`} onClick={() => deleteEntry(entry.id, entry.title)}>
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="journal-entry-content">{entry.content}</p>
              </article>
            ))}
            {meta.hasMoreJournalEntries ? (
              <button className="button button-secondary" type="button" onClick={loadOlder} disabled={loading}>
                {loading ? <LoaderCircle size={17} /> : null} Ver notas anteriores
              </button>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
