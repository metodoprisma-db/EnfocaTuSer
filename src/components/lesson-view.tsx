"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookHeart, Check, Gift, Headphones, LockKeyhole, Save, Sparkles } from "lucide-react";

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
  const [reviewingCompleted, setReviewingCompleted] = useState(false);

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
        <span className="eyebrow">Fotografía inicial pendiente</span>
        <h1>Antes del Descubrimiento 01, necesitamos tu punto de partida</h1>
        <p>Esta mirada breve no es un examen. Al finalizar los 15 descubrimientos la repetirás para hacer visible tu propio recorrido. Cuando la guardes, este paso se abrirá de inmediato.</p>
        <Link className="button button-primary" href="/"><ArrowLeft size={18} /> Completar mi fotografía inicial</Link>
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

  if (item.kind === "discovery" && completed && !reviewingCompleted) {
    return (
      <div className="page-wrap completion-page">
        <section className="completion-hero" aria-labelledby="completion-title">
          <span className="completion-mark"><Check size={27} aria-hidden="true" /></span>
          <span className="eyebrow">Descubrimiento {String(item.number).padStart(2, "0")} completado</span>
          <h1 id="completion-title">Lo que miraste hoy ya puede acompañarte afuera</h1>
          <p>
            No hace falta hacer nada más dentro del celular. El siguiente movimiento es sencillo: dejar que esta mirada aparezca, a su manera, en tu vida cotidiana.
          </p>
        </section>

        <section className="completion-integration">
          <IntegrationInvitation
            item={item}
            nextUnlockAt={item.index < 14 ? meta.progression.nextUnlockAt : null}
          />
        </section>

        <div className="completion-actions">
          <Link className="button button-primary" href="/">
            Volver a Mi espacio <ArrowRight size={18} />
          </Link>
          <button className="button button-quiet" type="button" onClick={() => setReviewingCompleted(true)}>
            Volver a leer este descubrimiento
          </button>
        </div>

        {item.hasGift && meta.giftUnlocked ? <section className="section"><GiftCard /></section> : null}
        {item.index === 14 && !meta.finalAssessment ? <section className="section"><JourneyAssessment stage="final" /></section> : null}
        {item.index === 14 && meta.finalAssessment ? <section className="section"><JourneyComparison /></section> : null}
      </div>
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

          {item.focus && item.whyItMatters ? (
            <section className="lesson-guidance-grid" aria-label="Sentido de este descubrimiento">
              <article><span className="eyebrow">Qué vamos a mirar</span><h2>La mirada de hoy</h2><p>{item.focus}</p></article>
              <article><span className="eyebrow">Por qué importa</span><h2>Lo que puede abrir</h2><p>{item.whyItMatters}</p></article>
            </section>
          ) : null}

          {item.presence ? (
            <section className="presence-pause">
              <span className="presence-pause-icon"><Sparkles size={19} aria-hidden="true" /></span>
              <div><span className="eyebrow">Antes de responder</span><h2>Haz una pausa para llegar</h2><p>{item.presence}</p></div>
            </section>
          ) : null}

          <section className="lesson-block lesson-perspective">
            <span className="eyebrow">Para comprenderlo</span>
            <h2>Una mirada posible</h2>
            <p>{item.insight}</p>
            {item.perspectives?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
          <section className="lesson-block"><span className="eyebrow">Preguntas de reflexión</span><h2>Escucha lo que aparece, sin corregirlo</h2><p className="helper-text">No necesitas responderlas todas. Quédate con la que haga espacio dentro de ti.</p><ul className="prompt-list">{item.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul></section>
          <section className="lesson-block lesson-gesture"><span className="eyebrow">Una experiencia breve</span><h2>Prueba un gesto pequeño</h2><p>{item.action}</p></section>

          <section className="lesson-block lesson-journal"><span className="eyebrow"><BookHeart size={15} /> Diario opcional</span><h2>¿Hay algo que quieras guardar?</h2><p className="helper-text">Puedes seguir sin escribir. Si comienzas una nota, quedará como borrador en este dispositivo.</p><div className="field"><label htmlFor="lesson-reflection">Una nota para ti</label><textarea id="lesson-reflection" value={reflection} onChange={(event) => { setReflection(event.target.value); setSaved(false); }} placeholder="Lo que sentí, comprendí o deseo recordar..." /></div><div className="button-row"><button className="button button-secondary" type="button" onClick={saveReflection} disabled={!reflection.trim()}><Save size={17} /> Guardar en Mi diario</button>{reflection.trim() ? <span className="draft-status">Borrador guardado en este dispositivo</span> : null}{saved ? <span className="completed-badge"><Check size={14} /> Nota guardada</span> : null}</div></section>
        </article>

        <aside className="lesson-aside">
          <div className="mentor-note"><span className="eyebrow">Para cerrar</span><p>{item.mentorNote}</p>{item.closing ? <p className="lesson-closing">{item.closing}</p> : null}<blockquote className="seed-quote">{item.seed}</blockquote></div>
          <button className={`button ${completed ? "button-secondary" : "button-primary"}`} type="button" onClick={() => actions.toggleProgress(item.kind, item.index)} disabled={completed}>
            <Check size={18} /> {completed ? "Ya forma parte de tu camino" : item.kind === "discovery" ? "Completar y llevarlo conmigo" : "Completar esta práctica"}
          </button>
          <p className="helper-text">{item.kind === "discovery" ? "Al completar, verás una invitación opcional para integrar lo vivido fuera de la pantalla." : "Podrás volver a esta práctica cuando quieras."}</p>
        </aside>
      </div>

      {item.hasGift && meta.giftUnlocked ? <section className="section"><GiftCard /></section> : null}
      {item.kind === "discovery" && item.index === 14 && completed && !meta.finalAssessment ? <section className="section"><JourneyAssessment stage="final" /></section> : null}
      {item.kind === "discovery" && item.index === 14 && completed && meta.finalAssessment ? <section className="section"><JourneyComparison /></section> : null}
    </div>
  );
}
