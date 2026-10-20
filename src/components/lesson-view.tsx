"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookHeart, Check, Gift, Headphones, LockKeyhole, Save } from "lucide-react";

import { GiftCard } from "@/components/gift-card";
import { JourneyAssessment, JourneyComparison } from "@/components/journey-assessment";
import { useAppState } from "@/context/app-state";
import { ASSETS } from "@/lib/constants";
import type { CatalogItem } from "@/types/app";

export function LessonView({ item }: { item: CatalogItem }) {
  const { actions, meta } = useAppState();
  const completed = item.kind === "discovery"
    ? meta.completedDiscoveries.has(item.index)
    : meta.completedExtras.has(item.index);
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);
  const locked = item.kind === "discovery" && !meta.isDiscoveryUnlocked(item.index);

  if (locked) {
    return (
      <div className="page-wrap">
        <div className="locked-lesson">
          <span className="locked-lesson-icon"><LockKeyhole size={28} /></span>
          <span className="eyebrow">Un paso a la vez</span>
          <h1>Este descubrimiento aún está cerrado</h1>
          <p>
            Completa primero el Descubrimiento {String(meta.nextDiscoveryIndex + 1).padStart(2, "0")}.
            La secuencia cuida el ritmo del camino y permite que cada paso tenga su espacio.
          </p>
          <Link className="button button-primary" href="/camino">
            <ArrowLeft size={18} /> Volver al paso disponible
          </Link>
        </div>
      </div>
    );
  }

  const saveReflection = () => {
    const clean = reflection.trim();
    if (!clean) return;
    actions.addJournalEntry({
      entryType: item.kind,
      itemIndex: item.index,
      title: item.title,
      content: clean,
    });
    setSaved(true);
    setReflection("");
  };

  return (
    <div className="page-wrap">
      <div style={{ marginBottom: 22 }}>
        <Link className="button button-quiet" href="/camino"><ArrowLeft size={18} /> Volver a mi camino</Link>
      </div>
      <div className="lesson-wrap">
        <article className="lesson-main">
          <span className="eyebrow">
            {item.kind === "discovery" ? "Descubrimiento" : "Práctica"} {String(item.number).padStart(2, "0")}
            {item.hasGift ? <Gift size={16} aria-label="Regalo especial" /> : null}
          </span>
          <h1>{item.title}</h1>
          <p className="lesson-lead">{item.description}</p>

          {item.kind === "discovery" && item.index <= 1 && !meta.initialAssessment ? (
            <div className="lesson-block">
              <JourneyAssessment stage="initial" />
            </div>
          ) : null}

          {item.audioUrl ? (
            <div className="lesson-block">
              <h2><Headphones size={25} style={{ marginRight: 10 }} /> Escuchar esta práctica</h2>
              <audio controls preload="none" style={{ width: "100%" }} src={item.audioUrl}>
                Tu navegador no puede reproducir este audio.
              </audio>
            </div>
          ) : null}

          <section className="lesson-block">
            <span className="eyebrow">Una mirada posible</span>
            <h2>Observa con suavidad</h2>
            <p>{item.insight}</p>
          </section>

          <section className="lesson-block">
            <span className="eyebrow">Preguntas para ti</span>
            <h2>Escucha lo que aparece</h2>
            <ul className="prompt-list">
              {item.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}
            </ul>
          </section>

          <section className="lesson-block">
            <span className="eyebrow">Un gesto posible</span>
            <h2>Llévalo a tu momento</h2>
            <p>{item.action}</p>
            <blockquote className="seed-quote">{item.seed}</blockquote>
          </section>

          <section className="lesson-block">
            <span className="eyebrow"><BookHeart size={15} /> Tu diario</span>
            <h2>¿Qué te llevas de aquí?</h2>
            <div className="field">
              <label htmlFor="lesson-reflection">Escribe una nota para ti</label>
              <textarea
                id="lesson-reflection"
                value={reflection}
                onChange={(event) => { setReflection(event.target.value); setSaved(false); }}
                placeholder="Lo que sentí, comprendí o deseo recordar..."
              />
            </div>
            <div className="button-row">
              <button className="button button-secondary" type="button" onClick={saveReflection} disabled={!reflection.trim()}>
                <Save size={17} /> Guardar en mi diario
              </button>
              {saved ? <span className="completed-badge"><Check size={14} /> Nota guardada</span> : null}
            </div>
          </section>
        </article>

        <aside className="lesson-aside">
          <div className="mentor-note">
            <Image src={ASSETS.mentors} width={104} height={104} alt="Clarissa Acevedo y Scarlett Vargas" />
            <p>{item.mentorNote}</p>
          </div>
          <button
            className={`button ${completed ? "button-secondary" : "button-primary"}`}
            style={{ width: "100%" }}
            type="button"
            onClick={() => actions.toggleProgress(item.kind, item.index)}
            disabled={completed && item.kind === "discovery"}
          >
            <Check size={18} /> {completed && item.kind === "discovery" ? "Descubrimiento recorrido" : completed ? "Marcar para volver a recorrer" : "Marcar como recorrido"}
          </button>
          <p className="helper-text" style={{ marginTop: 12 }}>
            {item.kind === "discovery"
              ? "Al completarlo se abrirá el siguiente descubrimiento."
              : "Puedes cambiar esta marca cuando lo necesites."}
          </p>
        </aside>
      </div>

      {item.hasGift ? <section className="section"><GiftCard /></section> : null}
      {item.kind === "discovery" && item.index === 14 && completed && !meta.finalAssessment ? (
        <section className="section"><JourneyAssessment stage="final" /></section>
      ) : null}
      {item.kind === "discovery" && item.index === 14 ? <section className="section"><JourneyComparison /></section> : null}
    </div>
  );
}
