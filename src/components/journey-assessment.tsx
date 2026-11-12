"use client";

import { useState, type FormEvent } from "react";
import { BookHeart, CalendarDays, Check, Footprints, Info, Repeat2, Sparkles } from "lucide-react";

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
          <span className="eyebrow">Respuestas conservadas</span>
          <h2>{isInitial ? "Ya puedes abrir el primer descubrimiento" : "Ya puedes comparar tus respuestas"}</h2>
          <p>
            {isInitial
              ? "Al terminar los quince descubrimientos volverás a responder estas cuatro preguntas."
              : "Ahora puedes ver qué elegiste al empezar y qué elegiste hoy."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="assessment-card" aria-labelledby={`${stage}-assessment-title`}>
      <div className="assessment-intro">
        <span className="eyebrow">{isInitial ? "Fotografía inicial" : "Fotografía final"}</span>
        <h2 id={`${stage}-assessment-title`}>
          {isInitial ? "¿Cómo te sientes hoy?" : "Después de los quince descubrimientos, ¿cómo te sientes?"}
        </h2>
        <p>
          {isInitial
            ? "A estas respuestas las llamamos fotografía inicial; no se usa la cámara. Lee cada pregunta y pulsa un número del 1 al 10 según cómo te sientes hoy."
            : "Responde las mismas cuatro preguntas según cómo te sientes hoy. Después podrás ver tus respuestas del comienzo y las de ahora."}
        </p>
        <div className="assessment-purpose" aria-label="Para qué sirve esta fotografía">
          <p><Info size={17} /> Lee las frases que aparecen junto al 1 y al 10 antes de elegir.</p>
          <p><Repeat2 size={17} /> Si te sientes entre las dos frases, puedes elegir un número del medio, como el 5.</p>
          <p><Footprints size={17} /> Puedes cambiar tu elección antes de pulsar el botón de abajo. Los números describen cómo te sientes; no son una calificación.</p>
        </div>
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
            placeholder="Hoy me siento..."
          />
        </div>
        {!complete ? <p className="form-guidance"><Info size={16} /> El botón se habilitará cuando elijas un número en las cuatro preguntas. La frase escrita es opcional.</p> : null}
        <button className="button button-primary" type="submit" disabled={!complete}>
          <Footprints size={18} /> {isInitial ? "Conservar mis respuestas y abrir el primer paso" : "Conservar mi fotografía final"}
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
        <span className="eyebrow">Lo que has caminado</span>
        <h2 id="journey-comparison-title">Tus respuestas del comienzo y de hoy</h2>
        <p>
          {!initial && !final
            ? "Cuando respondas las preguntas del comienzo y las del final, podrás verlas juntas aquí."
            : !initial
              ? "Tus respuestas finales están conservadas. Para compararlas hacen falta también las del comienzo. Puedes seguir consultando tus notas."
              : "Responde las cuatro preguntas finales para verlas junto a tus respuestas del comienzo."}
        </p>
      </section>
    );
  }

  return (
    <section className="journey-comparison" aria-labelledby="journey-comparison-title">
      <div className="comparison-heading">
        <div>
          <span className="eyebrow">Lo que has caminado</span>
          <h2 id="journey-comparison-title">Tus respuestas al empezar y al terminar</h2>
        </div>
        <p>Aquí puedes ver qué números elegiste al empezar y cuáles elegiste hoy. Pueden ser mayores, iguales o menores. Observa cómo estás ahora y qué te gustaría seguir practicando.</p>
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
