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
        <h1>Comienza por reconocer cómo estás hoy</h1>
        <p>La fotografía inicial son cuatro preguntas sobre cómo te sientes; se responde con números, sin usar la cámara. Al completarla podrás abrir el primer descubrimiento. Al final del recorrido volverás a responderlas para observar ambos momentos.</p>
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
        <h1>{integrating ? "Un tiempo para llevar lo aprendido a tu día" : "Este paso estará disponible más adelante"}</h1>
        <p>
          {integrating && meta.progression.nextUnlockAt
            ? `Podrás abrirlo el ${formatLocalMoment(meta.progression.nextUnlockAt)}, según el horario de este dispositivo. Puedes cerrar la aplicación y volver cuando te venga bien.`
            : item.kind === "extra"
              ? "Las prácticas de profundidad se habilitan juntas al completar el Descubrimiento 15."
              : "Cada descubrimiento se abre después del anterior y de su tiempo de integración. En Mi camino encontrarás cuál puedes abrir ahora."}
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
          <h1 id="completion-title">Te dedicaste un momento para escucharte</h1>
          <p>
            Puedes cerrar aquí y seguir con tu día. Más abajo tienes una propuesta opcional para recordar este encuentro fuera de la pantalla. Puedes hacerla cuando te resulte útil o simplemente dejarla pasar.
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
            <summary>Cómo recorrer este {item.kind === "discovery" ? "descubrimiento" : "ejercicio"}</summary>
            <p>Lee una sección a la vez. Cuando llegues a «Paso a paso», sigue las indicaciones a tu ritmo. Puedes mantener los ojos abiertos y elegir una postura cómoda.</p>
            <p>Las preguntas se pueden responder mentalmente o en el diario opcional. Al terminar por hoy, toca el botón «Completar». Puedes cerrar aunque te sientas igual que al comenzar y volver a leerlo más adelante.</p>
          </details>

          {item.audioUrl ? <section className="lesson-block"><h2><Headphones size={25} /> Escuchar esta práctica</h2><audio controls preload="none" src={item.audioUrl}>Tu navegador no puede reproducir este audio.</audio></section> : null}

          {item.focus && item.whyItMatters ? (
            <section className="lesson-guidance-grid" aria-label="Sentido de este descubrimiento">
              <article><span className="eyebrow">Qué vamos a observar</span><h2>La propuesta de hoy</h2><p>{item.focus}</p></article>
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
          <section className="lesson-block"><span className="eyebrow">Para reflexionar</span><h2>Escúchate: ¿qué llega primero a tu mente?</h2><p className="helper-text">Elige una pregunta que se acerque a tu experiencia. Puedes responder en silencio, escribir unas palabras más abajo o continuar con el ejercicio.</p><ul className="prompt-list">{item.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul></section>
          <section className="lesson-block lesson-gesture"><span className="eyebrow">{item.durationLabel}</span><h2>Paso a paso</h2><p>{item.action}</p><ol className="exercise-steps">{item.actionSteps.map((step) => <li key={step}>{step}</li>)}</ol><p className="helper-text">El tiempo es una referencia. Puedes adaptar la postura, pausar o terminar cuando lo necesites.</p></section>

          <section className="lesson-block lesson-journal"><span className="eyebrow"><BookHeart size={15} /> Diario opcional</span><h2>¿Qué te gustaría conservar de este momento?</h2><p className="helper-text">Puedes continuar sin escribir. Si escribes, tu texto se conserva como borrador en este dispositivo. Para que aparezca en Mi diario, toca «Conservar en Mi diario».</p><div className="field"><label htmlFor="lesson-reflection">Una nota para ti</label><textarea id="lesson-reflection" value={reflection} onChange={(event) => { setReflection(event.target.value); setSaved(false); }} placeholder="Hoy noté... / Me gustaría recordar..." /></div><div className="button-row"><button className="button button-secondary" type="button" onClick={saveReflection} disabled={!reflection.trim()}><Save size={17} /> Conservar en Mi diario</button>{reflection.trim() ? <span className="draft-status">Tu borrador se conserva en este dispositivo</span> : null}{saved ? <span className="completed-badge"><Check size={14} /> Ya puedes leer tu nota en Mi diario</span> : null}</div></section>
        </article>

        <aside className="lesson-aside">
          <div className="mentor-note"><span className="eyebrow">Para cerrar</span><p>{item.mentorNote}</p>{item.closing ? <p className="lesson-closing">{item.closing}</p> : null}<blockquote className="seed-quote">{item.seed}</blockquote></div>
          <button className={`button ${completed ? "button-secondary" : "button-primary"}`} type="button" onClick={() => actions.toggleProgress(item.kind, item.index)} disabled={completed}>
            <Check size={18} /> {completed ? "Ya forma parte de tu camino" : item.kind === "discovery" ? "Completar este descubrimiento" : "Completar esta práctica"}
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
