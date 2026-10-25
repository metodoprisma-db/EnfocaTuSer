"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, HeartHandshake, Play, RotateCcw, Save } from "lucide-react";

import { useAppState } from "@/context/app-state";

const emotions = ["Miedo", "Tristeza", "Enfado", "Culpa", "Vergüenza", "Desánimo", "Ansiedad", "Otra"];
const bodyPlaces = ["Pecho", "Garganta", "Estómago", "Cabeza", "Espalda", "Mandíbula", "Todo el cuerpo", "Otro lugar"];
const releaseOptions = ["Controlarlo todo", "Exigirme respuestas", "Repetir una historia", "Culparme", "Complacer", "Anticipar lo peor"];

interface PracticeDraft {
  feeling: string;
  intensityBefore: number;
  situation: string;
  bodyPlace: string;
  thoughtsReleased: string[];
  intensityAfter: number;
  releaseNote: string;
}

const initialDraft: PracticeDraft = {
  feeling: "",
  intensityBefore: 5,
  situation: "",
  bodyPlace: "",
  thoughtsReleased: [],
  intensityAfter: 3,
  releaseNote: "",
};

export function ReleasePractice() {
  const { actions } = useAppState();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PracticeDraft>(initialDraft);
  const [seconds, setSeconds] = useState(40);
  const [breathing, setBreathing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startBreathing = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSeconds(40);
    setBreathing(true);
    timerRef.current = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setBreathing(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  };

  const toggleRelease = (value: string) => {
    setDraft((current) => ({
      ...current,
      thoughtsReleased: current.thoughtsReleased.includes(value)
        ? current.thoughtsReleased.filter((item) => item !== value)
        : [...current.thoughtsReleased, value],
    }));
  };

  const finish = () => {
    actions.savePractice(draft);
    setStep(4);
  };

  const restart = () => {
    setDraft(initialDraft);
    setSeconds(40);
    setBreathing(false);
    setStep(0);
  };

  const titles = [
    "Nombra lo que está aquí",
    "Escucha dónde se siente",
    "Respira sin empujar",
    "Elige qué aflojar",
    "Guardaste este momento",
  ];

  return (
    <div className="practice-shell">
      <section className="practice-panel">
        <div className="step-indicator" aria-label={`Paso ${step + 1} de 5`}>
          {[0, 1, 2, 3, 4].map((index) => <span key={index} className={`step-dot${index === step ? " active" : index < step ? " done" : ""}`} />)}
        </div>
        <span className="eyebrow">Paso {step + 1} de 5</span>
        <h2>{titles[step]}</h2>

        {step === 0 ? (
          <>
            <p className="helper-text">Elige una palabra cercana a lo que sientes. No necesita ser perfecta.</p>
            <div className="emotion-grid">
              {emotions.map((emotion) => (
                <button key={emotion} type="button" className={`choice-chip${draft.feeling === emotion ? " selected" : ""}`} onClick={() => setDraft({ ...draft, feeling: emotion })}>{emotion}</button>
              ))}
            </div>
            <div className="field" style={{ marginTop: 28 }}>
              <span className="field-label">¿Qué intensidad tiene ahora?</span>
              <div className="range-row">
                <input aria-label="Intensidad inicial" type="range" min="0" max="10" value={draft.intensityBefore} onChange={(event) => setDraft({ ...draft, intensityBefore: Number(event.target.value) })} />
                <span className="range-value">{draft.intensityBefore}</span>
              </div>
            </div>
            {draft.intensityBefore >= 8 ? (
              <div className="care-message"><HeartHandshake size={20} /> Si esto se siente muy intenso, considera hacer una pausa y buscar la compañía de alguien de confianza o de una persona profesional.</div>
            ) : null}
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div className="field">
              <label htmlFor="situation">¿Qué situación despertó esta emoción?</label>
              <textarea id="situation" value={draft.situation} onChange={(event) => setDraft({ ...draft, situation: event.target.value })} placeholder="Describe solo lo que te resulte cómodo..." />
            </div>
            <div className="field" style={{ marginTop: 24 }}>
              <span className="field-label">¿En qué parte del cuerpo la notas?</span>
              <div className="chip-grid">
                {bodyPlaces.map((place) => (
                  <button key={place} type="button" className={`choice-chip${draft.bodyPlace === place ? " selected" : ""}`} onClick={() => setDraft({ ...draft, bodyPlace: place })}>{place}</button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <p>Permite que el aire llegue y salga con naturalidad. El orbe puede acompañar cinco ciclos suaves durante 40 segundos.</p>
            <button className="button button-primary" type="button" onClick={startBreathing} disabled={breathing}>
              <Play size={17} /> {seconds === 0 ? "Respirar otra vez" : breathing ? "Respirando..." : "Comenzar 40 segundos"}
            </button>
            <p className="helper-text" style={{ marginTop: 18 }}>Puedes continuar cuando notes un poco más de espacio.</p>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="field">
              <span className="field-label">¿Qué deseas aflojar por este momento?</span>
              <div className="chip-grid">
                {releaseOptions.map((option) => (
                  <button key={option} type="button" className={`choice-chip${draft.thoughtsReleased.includes(option) ? " selected" : ""}`} onClick={() => toggleRelease(option)}>{option}</button>
                ))}
              </div>
            </div>
            <div className="field" style={{ marginTop: 24 }}>
              <label htmlFor="release-note">Una frase para recordar lo que descubriste</label>
              <textarea id="release-note" value={draft.releaseNote} onChange={(event) => setDraft({ ...draft, releaseNote: event.target.value })} placeholder="Ahora reconozco que..." />
            </div>
            <div className="field" style={{ marginTop: 24 }}>
              <span className="field-label">¿Qué intensidad sientes al cerrar?</span>
              <div className="range-row">
                <input aria-label="Intensidad al cerrar" type="range" min="0" max="10" value={draft.intensityAfter} onChange={(event) => setDraft({ ...draft, intensityAfter: Number(event.target.value) })} />
                <span className="range-value">{draft.intensityAfter}</span>
              </div>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <div>
            <div className="stat-icon"><Check size={22} /></div>
            <p>
              Este registro quedó en tu diario. Te diste un momento para escuchar lo que estaba presente y cuidar tu siguiente paso.
            </p>
            <button className="button button-secondary" type="button" onClick={restart}><RotateCcw size={17} /> Hacer otra pausa</button>
          </div>
        ) : null}

        {step < 4 ? (
          <div className="button-row" style={{ marginTop: 34 }}>
            {step > 0 ? <button className="button button-quiet" type="button" onClick={() => setStep((current) => current - 1)}><ChevronLeft size={18} /> Volver</button> : null}
            {step < 3 ? (
              <button className="button button-primary" type="button" onClick={() => setStep((current) => current + 1)} disabled={step === 0 && !draft.feeling}>
                Continuar <ChevronRight size={18} />
              </button>
            ) : (
              <button className="button button-primary" type="button" onClick={finish}><Save size={18} /> Guardar este momento</button>
            )}
          </div>
        ) : null}
      </section>

      <aside className="breath-panel">
        <div className="breath-orb-wrap">
          <div className={`breath-orb${breathing ? " active" : ""}`} aria-live="polite">
            <strong>{breathing ? seconds : step === 2 && seconds === 0 ? "Aquí" : "Respira"}</strong>
          </div>
          <p style={{ maxWidth: 320, marginTop: 34, color: "var(--etq-chocolate-suave)" }}>
            Inhala con suavidad. Suelta el aire sin forzar. Tu cuerpo puede marcar el compás.
          </p>
        </div>
      </aside>
    </div>
  );
}
