"use client";

import { useState, type FormEvent } from "react";
import {
  BookHeart,
  CalendarDays,
  Check,
  Footprints,
  Sparkles,
} from "lucide-react";

import { useAppState } from "@/context/app-state";
import type { AssessmentStage, UserAssessment } from "@/types/app";

const indicators = [
  { key: "calmScore", label: "Calma mental frente a la prisa" },
  {
    key: "selfKindnessScore",
    label: "Amabilidad conmigo misma sin autoexigencia",
  },
  { key: "clarityScore", label: "Claridad sobre lo que siento" },
  { key: "peaceScore", label: "Sensación de paz y presencia hoy" },
] as const;

type Scores = Pick<
  UserAssessment,
  "calmScore" | "selfKindnessScore" | "clarityScore" | "peaceScore"
>;

const initialScores: Scores = {
  calmScore: 5,
  selfKindnessScore: 5,
  clarityScore: 5,
  peaceScore: 5,
};

export function JourneyAssessment({ stage }: { stage: AssessmentStage }) {
  const { actions } = useAppState();
  const [scores, setScores] = useState(initialScores);
  const [reflectionNote, setReflectionNote] = useState("");
  const [saved, setSaved] = useState(false);
  const isInitial = stage === "initial";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    actions.saveAssessment({ stage, ...scores, reflectionNote });
    setSaved(true);
  };

  if (saved) {
    return (
      <section className="assessment-card assessment-saved" aria-live="polite">
        <span className="assessment-check"><Check size={24} /></span>
        <div>
          <span className="eyebrow">Fotografía guardada</span>
          <h2>{isInitial ? "Este es tu punto de partida" : "Tu camino ya puede mirarse completo"}</h2>
          <p>
            {isInitial
              ? "No es una nota ni una exigencia. Es una forma amable de recordar cómo te sentías al comenzar."
              : "La comparación está lista para mostrarte movimientos reales, incluso los que parecían pequeños."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="assessment-card" aria-labelledby={`${stage}-assessment-title`}>
      <div className="assessment-intro">
        <span className="eyebrow">
          {isInitial ? "Fotografía Inicial" : "Fotografía Final"}
        </span>
        <h2 id={`${stage}-assessment-title`}>
          {isInitial ? "¿Cómo estás llegando hoy?" : "¿Cómo te encuentras ahora?"}
        </h2>
        <p>
          Mueve cada barra del 1 al 10 según lo que sientes. No hay respuestas
          correctas y este registro es privado.
        </p>
      </div>
      <form className="assessment-form" onSubmit={submit}>
        {indicators.map((indicator) => (
          <div className="assessment-range" key={indicator.key}>
            <div className="assessment-range-label">
              <label htmlFor={`${stage}-${indicator.key}`}>
                {indicator.label}
              </label>
              <output htmlFor={`${stage}-${indicator.key}`}>
                {scores[indicator.key]}
              </output>
            </div>
            <input
              id={`${stage}-${indicator.key}`}
              type="range"
              min="1"
              max="10"
              value={scores[indicator.key]}
              onChange={(event) =>
                setScores((current) => ({
                  ...current,
                  [indicator.key]: Number(event.target.value),
                }))
              }
            />
            <div className="range-ends" aria-hidden="true">
              <span>Necesita cuidado</span>
              <span>Se siente presente</span>
            </div>
          </div>
        ))}
        <div className="field">
          <label htmlFor={`${stage}-reflection`}>
            Una frase para recordar este momento (opcional)
          </label>
          <textarea
            id={`${stage}-reflection`}
            value={reflectionNote}
            onChange={(event) => setReflectionNote(event.target.value)}
            placeholder="Hoy reconozco que..."
          />
        </div>
        <button className="button button-primary" type="submit">
          <Footprints size={18} /> Guardar mi fotografía
        </button>
      </form>
    </section>
  );
}

export function JourneyComparison() {
  const { meta } = useAppState();
  const initial = meta.initialAssessment;
  const final = meta.finalAssessment;
  if (!initial || !final || !meta.pathComplete) return null;

  return (
    <section className="journey-comparison" aria-labelledby="journey-comparison-title">
      <div className="comparison-heading">
        <div>
          <span className="eyebrow">Lo que has caminado</span>
          <h2 id="journey-comparison-title">Tu transformación, mirada con ternura</h2>
        </div>
        <p>
          Estos números no miden tu valor. Solo acercan dos fotografías para
          que puedas reconocer movimientos que la prisa suele esconder.
        </p>
      </div>

      <div className="comparison-list">
        {indicators.map((indicator) => {
          const start = initial[indicator.key];
          const current = final[indicator.key];
          const difference = current - start;
          return (
            <article className="comparison-row" key={indicator.key}>
              <div className="comparison-label">
                <h3>{indicator.label}</h3>
                <span>
                  {difference > 0
                    ? `Reconoces ${difference} puntos más`
                    : difference < 0
                      ? "Hoy este aspecto pide más cuidado"
                      : "Se mantuvo presente a su manera"}
                </span>
              </div>
              <div className="comparison-values">
                <div>
                  <span>Al comenzar</span>
                  <strong>{start}</strong>
                </div>
                <div className="comparison-track" aria-hidden="true">
                  <span style={{ width: `${start * 10}%` }} />
                  <span style={{ width: `${current * 10}%` }} />
                </div>
                <div>
                  <span>Hoy</span>
                  <strong>{current}</strong>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="achievement-grid">
        <article>
          <CalendarDays size={21} />
          <strong>{meta.journeyDays}</strong>
          <span>{meta.journeyDays === 1 ? "día de camino" : "días de camino"}</span>
        </article>
        <article>
          <Sparkles size={21} />
          <strong>{meta.stats.pausesCompleted}</strong>
          <span>pausas para soltar</span>
        </article>
        <article>
          <BookHeart size={21} />
          <strong>{meta.stats.reflectionsWritten}</strong>
          <span>reflexiones escritas</span>
        </article>
      </div>

      <p className="completion-note">
        Completaste los 15 pasos y formas parte del grupo comprometido de
        mujeres que recorren este camino entero. Clarissa y Scarlett celebran
        la presencia que elegiste una y otra vez.
      </p>
    </section>
  );
}
