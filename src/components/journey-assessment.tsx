"use client";

import { useState, type FormEvent } from "react";
import { BookHeart, CalendarDays, Check, Footprints, Info, Sparkles } from "lucide-react";

import { useAppState } from "@/context/app-state";
import { ASSESSMENT_INDICATORS, compareAssessments, type AssessmentScoreKey } from "@/lib/assessment";
import type { AssessmentStage } from "@/types/app";

const indicators = ASSESSMENT_INDICATORS;
type Scores = Record<AssessmentScoreKey, number | null>;

const emptyScores: Scores = {
  calmScore: null,
  selfKindnessScore: null,
  clarityScore: null,
  peaceScore: null,
};

export function JourneyAssessment({ stage }: { stage: AssessmentStage }) {
  const { actions } = useAppState();
  const [scores, setScores] = useState<Scores>(emptyScores);
  const [reflectionNote, setReflectionNote] = useState("");
  const [saved, setSaved] = useState(false);
  const isInitial = stage === "initial";
  const complete = indicators.every(({ key }) => scores[key] !== null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!complete) return;
    actions.saveAssessment({
      stage,
      calmScore: scores.calmScore as number,
      selfKindnessScore: scores.selfKindnessScore as number,
      clarityScore: scores.clarityScore as number,
      peaceScore: scores.peaceScore as number,
      reflectionNote,
    });
    setSaved(true);
  };

  if (saved) {
    return (
      <section className="assessment-card assessment-saved" aria-live="polite">
        <span className="assessment-check"><Check size={24} /></span>
        <div>
          <span className="eyebrow">Mirada guardada</span>
          <h2>{isInitial ? "Tu punto de partida quedó contigo" : "Tu mirada de hoy ya está lista"}</h2>
          <p>
            {isInitial
              ? "No es una nota ni un diagnóstico. Es tu percepción de este momento, elegida conscientemente por ti."
              : "Ahora puedes acercar ambos momentos sin convertirlos en una competencia."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="assessment-card" aria-labelledby={`${stage}-assessment-title`}>
      <div className="assessment-intro">
        <span className="eyebrow">{isInitial ? "Tu punto de partida" : "Tu mirada de hoy"}</span>
        <h2 id={`${stage}-assessment-title`}>
          {isInitial ? "Antes de comenzar, ¿cómo te sientes?" : "Al cerrar este camino, ¿cómo te sientes?"}
        </h2>
        <p>
          Elige del 1 al 10 desde tu percepción de hoy. No hay respuestas correctas, no es una evaluación clínica y nada se guarda hasta que elijas los cuatro valores.
        </p>
      </div>
      <form className="assessment-form" onSubmit={submit}>
        {indicators.map((indicator) => {
          const endpointsId = `${stage}-${indicator.key}-ends`;
          return (
            <fieldset className="assessment-scale" key={indicator.key}>
              <legend>{indicator.label}</legend>
              <div className="assessment-options">
                {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                  <label className="assessment-option" key={value}>
                    <input
                      type="radio"
                      name={`${stage}-${indicator.key}`}
                      value={value}
                      checked={scores[indicator.key] === value}
                      aria-label={`${value} de 10`}
                      aria-describedby={endpointsId}
                      onChange={() => setScores((current) => ({ ...current, [indicator.key]: value }))}
                    />
                    <span aria-hidden="true">{value}</span>
                  </label>
                ))}
              </div>
              <div className="range-ends" id={endpointsId}>
                <span>1: {indicator.startLabel}</span>
                <span>10: {indicator.endLabel}</span>
              </div>
            </fieldset>
          );
        })}
        <div className="field">
          <label htmlFor={`${stage}-reflection`}>Una frase para recordar este momento (opcional)</label>
          <textarea
            id={`${stage}-reflection`}
            value={reflectionNote}
            onChange={(event) => setReflectionNote(event.target.value)}
            placeholder="Hoy reconozco que..."
          />
        </div>
        {!complete ? <p className="form-guidance"><Info size={16} /> Elige un valor para cada indicador antes de guardar.</p> : null}
        <button className="button button-primary" type="submit" disabled={!complete}>
          <Footprints size={18} /> Guardar esta mirada
        </button>
      </form>
    </section>
  );
}

function differenceCopy(start: number, current: number) {
  const difference = current - start;
  if (difference === 0) return "Elegiste el mismo valor en ambos momentos";
  const direction = difference > 0 ? "más" : "menos";
  return `Hoy elegiste ${Math.abs(difference)} ${Math.abs(difference) === 1 ? "punto" : "puntos"} ${direction}`;
}

export function JourneyComparison() {
  const { meta } = useAppState();
  if (!meta.pathComplete) return null;
  const initial = meta.initialAssessment;
  const final = meta.finalAssessment;
  const comparison = compareAssessments(initial, final);

  if (comparison.status === "incomplete") {
    return (
      <section className="journey-comparison comparison-missing" aria-labelledby="journey-comparison-title">
        <span className="eyebrow">Mira cuánto has recorrido</span>
        <h2 id="journey-comparison-title">Aún no podemos acercar los dos momentos</h2>
        <p>
          {!initial && !final
            ? "Faltan tu punto de partida y tu mirada de hoy. No mostraremos resultados inventados."
            : !initial
              ? "Falta tu punto de partida. Conservamos tu mirada de hoy, pero no inventaremos una comparación."
              : "Falta tu mirada de hoy. Cuando la completes, podrás ver ambos momentos juntos."}
        </p>
      </section>
    );
  }

  return (
    <section className="journey-comparison" aria-labelledby="journey-comparison-title">
      <div className="comparison-heading">
        <div>
          <span className="eyebrow">Mira cuánto has recorrido</span>
          <h2 id="journey-comparison-title">Dos momentos de tu propia mirada</h2>
        </div>
        <p>Estos números no miden tu valor ni prometen una transformación. Solo acercan cómo te percibías entonces y cómo te percibes hoy.</p>
      </div>

      <div className="comparison-list">
        {comparison.rows.map((indicator) => {
          const { start, current } = indicator;
          return (
            <article className="comparison-row" key={indicator.key}>
              <div className="comparison-label">
                <h3>{indicator.label}</h3>
                <span>{differenceCopy(start, current)}</span>
              </div>
              <div className="comparison-values">
                <div><span>Al comenzar</span><strong>{start}</strong></div>
                <div className="comparison-track" aria-hidden="true">
                  <span style={{ width: `${start * 10}%` }} />
                  <span style={{ width: `${current * 10}%` }} />
                </div>
                <div><span>Hoy</span><strong>{current}</strong></div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="achievement-grid">
        <article><CalendarDays size={21} /><strong>{meta.journeyDays}</strong><span>{meta.journeyDays === 1 ? "día de camino" : "días de camino"}</span></article>
        <article><Sparkles size={21} /><strong>{meta.stats.pausesCompleted}</strong><span>pausas para soltar</span></article>
        <article><BookHeart size={21} /><strong>{meta.stats.reflectionsWritten}</strong><span>reflexiones escritas</span></article>
      </div>

      <p className="completion-note">Completaste los 15 pasos. Cada regreso, cada pausa y cada elección fueron tuyos.</p>
    </section>
  );
}
