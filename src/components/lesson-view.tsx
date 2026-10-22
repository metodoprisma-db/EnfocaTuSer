"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookHeart, Check, Gift, Headphones, LockKeyhole, Save } from "lucide-react";

import { GiftCard } from "@/components/gift-card";
import { IntegrationInvitation, formatLocalMoment } from "@/components/integration-invitation";
import { JourneyAssessment, JourneyComparison } from "@/components/journey-assessment";
import { useAppState } from "@/context/app-state";
import { lessonDraftKey } from "@/lib/draft-storage";
import type { CatalogItem } from "@/types/app";

export function LessonView({ item }: { item: CatalogItem }) {
  const { actions, meta, state } = useAppState();
  const completed = item.kind === "discovery"
    ? meta.completedDiscoveries.has(item.index)
    : meta.completedExtras.has(item.index);
  const status = item.kind === "discovery"
    ? meta.progression.discoveryStatus(item.index)
    : meta.progression.extraStatus(item.index);
  const locked = status !== "completed" && status !== "available";
  const identity = state.user?.id ?? "guest";
  const draftKey = useMemo(
    () => lessonDraftKey(identity, item.kind, item.index),
    [identity, item.index, item.kind],
  );
  const [reflection, setReflection] = useState("");
  const [loadedDraftKey, setLoadedDraftKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setReflection(window.localStorage.getItem(draftKey) ?? "");
      setLoadedDraftKey(draftKey);
    });
    return () => {
      active = false;
    };
  }, [draftKey]);

  useEffect(() => {
    if (loadedDraftKey !== draftKey) return;
    if (reflection) window.localStorage.setItem(draftKey, reflection);
    else window.localStorage.removeItem(draftKey);
  }, [draftKey, loadedDraftKey, reflection]);

  useEffect(() => {
    if (!reflection.trim()) return;
    const protectDraft = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", protectDraft);
    return () => window.removeEventListener("beforeunload", protectDraft);
  }, [reflection]);

  if (item.kind === "discovery" && !meta.initialAssessment) {
    return (
      <div className="page-wrap"><div className="locked-lesson">
        <span className="locked-lesson-icon"><BookHeart size={28} /></span>
        <span className="eyebrow">Tu mirada primero</span>
        <h1>Antes de este descubrimiento está tu punto de partida</h1>
        <p>Vuelve a Mi espacio y elige conscientemente los cuatro indicadores. No guardaremos ninguna puntuación por ti.</p>
        <Link className="button button-primary" href="/"><ArrowLeft size={18} /> Ir a Mi espacio</Link>
      </div></div>
    );
  }

  if (locked) {
    const integrating = status === "integrating";
    return (
      <div className="page-wrap"><div className="locked-lesson">
        <span className="locked-lesson-icon"><LockKeyhole size={28} /></span>
        <span className="eyebrow">Un paso a la vez</span>
        <h1>{integrating ? "Este descubrimiento está encontrando su lugar" : "Este espacio todavía está cerrado"}</h1>
        <p>
          {integrating && meta.progression.nextUnlockAt
            ? `Podrás abrirlo el ${formatLocalMoment(meta.progression.nextUnlockAt)}. La fecha es orientativa y no necesitas esperar en la pantalla.`
            : item.kind === "extra"
              ? "Las prácticas de profundidad se habilitan juntas al completar el Descubrimiento 15."
              : "La secuencia cuida el ritmo del camino. Vuelve al paso que está disponible ahora."}
        </p>
        <Link className="button button-primary" href="/camino"><ArrowLeft size={18} /> Volver a Mi camino</Link>
      </div></div>
    );
  }

  const saveReflection = () => {
    const clean = reflection.trim();
    if (!clean) return;
    actions.addJournalEntry({ entryType: item.kind, itemIndex: item.index, title: item.title, content: clean });
    setSaved(true);
    setReflection("");
    window.localStorage.removeItem(draftKey);
  };

  return (
    <div className="page-wrap lesson-page">
      <div className="lesson-back"><Link className="button button-quiet" href="/camino"><ArrowLeft size={18} /> Volver a Mi camino</Link></div>
      <div className="lesson-wrap">
        <article className="lesson-main">
          <header className="lesson-header">
            <span className="eyebrow">{item.kind === "discovery" ? "Descubrimiento" : "Práctica"} {String(item.number).padStart(2, "0")}{item.hasGift ? <Gift size={16} aria-label="Regalo especial" /> : null}</span>
            <h1>{item.title}</h1>
            <p className="lesson-lead">{item.description}</p>
          </header>

          {item.audioUrl ? <section className="lesson-block"><h2><Headphones size={25} /> Escuchar esta práctica</h2><audio controls preload="none" src={item.audioUrl}>Tu navegador no puede reproducir este audio.</audio></section> : null}

          <section className="lesson-block lesson-perspective"><span className="eyebrow">Perspectiva</span><h2>Una mirada posible</h2><p>{item.insight}</p></section>
          <section className="lesson-block"><span className="eyebrow">Preguntas para ti</span><h2>Escucha lo que aparece</h2><ul className="prompt-list">{item.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul></section>
          <section className="lesson-block lesson-gesture"><span className="eyebrow">Un gesto posible</span><h2>Llévalo a este momento</h2><p>{item.action}</p><blockquote className="seed-quote">{item.seed}</blockquote></section>

          <section className="lesson-block lesson-journal"><span className="eyebrow"><BookHeart size={15} /> Diario opcional</span><h2>¿Hay algo que quieras guardar?</h2><p className="helper-text">Puedes seguir sin escribir. Si comienzas una nota, quedará como borrador en este dispositivo.</p><div className="field"><label htmlFor="lesson-reflection">Una nota para ti</label><textarea id="lesson-reflection" value={reflection} onChange={(event) => { setReflection(event.target.value); setSaved(false); }} placeholder="Lo que sentí, comprendí o deseo recordar..." /></div><div className="button-row"><button className="button button-secondary" type="button" onClick={saveReflection} disabled={!reflection.trim()}><Save size={17} /> Guardar en Mi diario</button>{reflection.trim() ? <span className="draft-status">Borrador guardado en este dispositivo</span> : null}{saved ? <span className="completed-badge"><Check size={14} /> Nota guardada</span> : null}</div></section>
        </article>

        <aside className="lesson-aside">
          <div className="mentor-note"><span className="eyebrow">Una nota cercana</span><p>{item.mentorNote}</p></div>
          <button className={`button ${completed ? "button-secondary" : "button-primary"}`} type="button" onClick={() => actions.toggleProgress(item.kind, item.index)} disabled={completed}>
            <Check size={18} /> {completed ? "Ya forma parte de tu camino" : "Cerrar este paso"}
          </button>
          <p className="helper-text">{item.kind === "discovery" ? "Al cerrarlo comienza un tiempo breve de integración." : "Podrás volver a esta práctica cuando quieras."}</p>
        </aside>
      </div>

      {item.kind === "discovery" && completed ? <section className="section completion-section"><IntegrationInvitation item={item} nextUnlockAt={item.index < 14 ? meta.progression.nextUnlockAt : null} /></section> : null}
      {item.hasGift && meta.giftUnlocked ? <section className="section"><GiftCard /></section> : null}
      {item.kind === "discovery" && item.index === 14 && completed && !meta.finalAssessment ? <section className="section"><JourneyAssessment stage="final" /></section> : null}
      {item.kind === "discovery" && item.index === 14 && completed && meta.finalAssessment ? <section className="section"><JourneyComparison /></section> : null}
    </div>
  );
}
