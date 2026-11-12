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
        <span className="eyebrow">Tu punto de partida</span>
        <h1>Primero, responde cómo te sientes hoy</h1>
        <p>En Mi espacio hay cuatro preguntas. Elige un número en cada una para abrir el primer descubrimiento. A estas respuestas las llamamos fotografía inicial; no se usa la cámara.</p>
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
        <h1>{integrating ? "Tu próximo descubrimiento se abrirá a esta hora" : "Este paso se abrirá más adelante"}</h1>
        <p>
          {integrating && meta.progression.nextUnlockAt
            ? `Podrás abrirlo el ${formatLocalMoment(meta.progression.nextUnlockAt)}, según el horario de este dispositivo. Puedes cerrar la aplicación y volver cuando te venga bien.`
            : item.kind === "extra"
              ? "Las doce prácticas se abren cuando completas el Descubrimiento 15. Después puedes elegir cuál quieres hacer."
              : "Primero completa el descubrimiento anterior. Después habrá un tiempo de espera. En Mi camino puedes ver cuál puedes abrir ahora."}
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
          <h1 id="completion-title">Terminaste este descubrimiento</h1>
          <p>
            Puedes cerrar la aplicación y seguir con tu día. Si quieres, más abajo tienes una idea para recordar lo que hiciste. Puedes probarla cuando te venga bien.
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

          <details className="lesson-howto" open={item.kind === "discovery" && item.index === 0}>
            <summary>Cómo hacer este ejercicio</summary>
            <p>Lee una sección a la vez. En «Paso a paso» encontrarás las acciones del ejercicio. Si quieres cerrar los ojos, lee primero las indicaciones.</p>
            <p>Puedes pensar las respuestas, decirlas en voz baja o escribirlas. Al terminar, pulsa «Completar». Puedes volver a leer este ejercicio cuando quieras.</p>
          </details>

          {item.audioUrl ? <section className="lesson-block"><h2><Headphones size={25} /> Escuchar esta práctica</h2><audio controls preload="none" src={item.audioUrl}>Tu navegador no puede reproducir este audio.</audio></section> : null}

          {item.focus && item.whyItMatters ? (
            <section className="lesson-guidance-grid" aria-label="Sobre este ejercicio">
              <article><h2>Qué vas a observar</h2><p>{item.focus}</p></article>
              <article><h2>Lo que puedes descubrir</h2><p>{item.whyItMatters}</p></article>
            </section>
          ) : null}

          {item.presence ? (
            <section className="presence-pause">
              <span className="presence-pause-icon"><Sparkles size={19} aria-hidden="true" /></span>
              <div><span className="eyebrow">Antes de empezar</span><h2>Detente, haz una pausa</h2><p>{item.presence}</p></div>
            </section>
          ) : null}

          <section className="lesson-block lesson-perspective">
            <h2>Para entender el ejercicio</h2>
            <p>{item.insight}</p>
            {item.perspectives?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
          <section className="lesson-block"><span className="eyebrow">Preguntas para reflexionar</span><h2>Escúchate</h2><p className="helper-text">Elige una pregunta que tenga sentido para ti. Puedes pensar la respuesta o escribirla más abajo.</p><ul className="prompt-list">{item.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul></section>
          <section className="lesson-block lesson-gesture"><span className="eyebrow">{item.durationLabel}</span><h2>Paso a paso</h2><p>{item.action}</p><ol className="exercise-steps">{item.actionSteps.map((step) => <li key={step}>{step}</li>)}</ol><p className="helper-text">La duración es aproximada. Puedes hacerlo a tu ritmo y parar cuando quieras.</p></section>

          <section className="lesson-block lesson-journal"><span className="eyebrow"><BookHeart size={15} /> Escribir es opcional</span><h2>¿Quieres escribir una nota para ti?</h2><p className="helper-text">Escribe lo que quieras recordar. Para leerlo después en Mi diario, pulsa «Conservar en Mi diario». Mientras escribes, se conserva un borrador en este dispositivo.</p><div className="field"><label htmlFor="lesson-reflection">Una nota para ti</label><textarea id="lesson-reflection" value={reflection} onChange={(event) => { setReflection(event.target.value); setSaved(false); }} placeholder="Hoy noté... / Me gustaría recordar..." /></div><div className="button-row"><button className="button button-secondary" type="button" onClick={saveReflection} disabled={!reflection.trim()}><Save size={17} /> Conservar en Mi diario</button>{reflection.trim() ? <span className="draft-status">Borrador conservado en este dispositivo</span> : null}{saved ? <span className="completed-badge"><Check size={14} /> Tu nota ya está en Mi diario</span> : null}</div></section>
        </article>

        <aside className="lesson-aside">
          <div className="mentor-note"><span className="eyebrow">Clarissa y Scarlett</span><p>{item.mentorNote}</p>{item.closing ? <p className="lesson-closing">{item.closing}</p> : null}<p className="helper-text">Si te ayuda, repite esta frase en silencio:</p><blockquote className="seed-quote">{item.seed}</blockquote></div>
          <button className={`button ${completed ? "button-secondary" : "button-primary"}`} type="button" onClick={() => actions.toggleProgress(item.kind, item.index)} disabled={completed}>
            <Check size={18} /> {completed ? "Ya completaste este ejercicio" : item.kind === "discovery" ? "Completar este descubrimiento" : "Completar esta práctica"}
          </button>
          <p className="helper-text">{item.kind === "discovery" ? "Después verás una idea opcional para probar durante el día." : "Puedes volver a hacer esta práctica cuando quieras."}</p>
        </aside>
      </div>

      {item.hasGift && meta.giftUnlocked ? <section className="section"><GiftCard /></section> : null}
      {item.kind === "discovery" && item.index === 14 && completed && !meta.finalAssessment ? <section className="section"><JourneyAssessment stage="final" /></section> : null}
      {item.kind === "discovery" && item.index === 14 && completed && meta.finalAssessment ? <section className="section"><JourneyComparison /></section> : null}
    </div>
  );
}
