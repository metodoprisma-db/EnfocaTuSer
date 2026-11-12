"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, HeartHandshake, Play, RotateCcw, Save } from "lucide-react";

import { useAppState } from "@/context/app-state";

const emotions = ["Calma", "Alegría", "Miedo", "Tristeza", "Enfado", "Culpa", "Vergüenza", "Desánimo", "Inquietud", "Otra", "Aún no lo sé"];
const bodyPlaces = ["Pecho", "Garganta", "Estómago", "Cabeza", "Espalda", "Mandíbula", "Todo el cuerpo", "Otro lugar", "No sé dónde la siento"];
const releaseOptions = ["Atender una sola tarea", "Darme tiempo para responder", "Observar lo que tengo delante", "Hablarme con amabilidad", "Decir lo que necesito", "Pedir más información"];

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
  intensityAfter: 5,
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

  const stopBreathing = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setBreathing(false);
  };

  const changeStep = (nextStep: number) => {
    stopBreathing();
    setStep(nextStep);
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
    stopBreathing();
    actions.savePractice(draft);
    setStep(4);
  };

  const restart = () => {
    stopBreathing();
    setDraft(initialDraft);
    setSeconds(40);
    setBreathing(false);
    setStep(0);
  };

  const titles = [
    "Elige una palabra para lo que sientes",
    "Observa cómo está tu cuerpo",
    "Respira con suavidad",
    "Elige qué quieres hacer ahora",
    "Tu pausa quedó en Mi diario",
  ];
  const elapsed = 40 - seconds;
  const breathCycle = Math.min(5, Math.floor(elapsed / 8) + 1);
  const breathPhase = elapsed % 8 < 3 ? "Inhala lentamente" : "Exhala con total suavidad";

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
            <p>Acomódate y pulsa la palabra que se parezca a cómo te sientes. Si aún no sabes cómo llamarlo, puedes elegir «Aún no lo sé».</p>
            <div className="emotion-grid">
              {emotions.map((emotion) => (
                <button key={emotion} type="button" className={`choice-chip${draft.feeling === emotion ? " selected" : ""}`} aria-pressed={draft.feeling === emotion} onClick={() => setDraft({ ...draft, feeling: emotion })}>{emotion}</button>
              ))}
            </div>
            <div className="field" style={{ marginTop: 28 }}>
              <span className="field-label">¿Cuánto la notas ahora?</span>
              <p className="helper-text" id="intensity-before-help">Desliza el punto sobre la línea para elegir un número. 0: apenas la noto. 10: la siento muy fuerte.</p>
              <div className="range-row">
                <input aria-label="Cuánto noto la emoción al comenzar" aria-describedby="intensity-before-help" type="range" min="0" max="10" value={draft.intensityBefore} onChange={(event) => setDraft({ ...draft, intensityBefore: Number(event.target.value), intensityAfter: Number(event.target.value) })} />
                <span className="range-value">{draft.intensityBefore}</span>
              </div>
            </div>
            {draft.intensityBefore >= 8 ? (
              <div className="care-message"><HeartHandshake size={20} /> Si necesitas compañía, puedes parar y hablar con alguien de confianza o un profesional de salud.</div>
            ) : null}
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div className="field">
              <label htmlFor="situation">¿Quieres escribir qué pasó? (opcional)</label>
              <textarea id="situation" value={draft.situation} onChange={(event) => setDraft({ ...draft, situation: event.target.value })} placeholder="Hoy pasó..." />
            </div>
            <div className="field" style={{ marginTop: 24 }}>
              <span className="field-label">¿En qué parte del cuerpo la notas?</span>
              <p className="helper-text">Puedes sentir calor en la cara o tensión en los hombros, por ejemplo. Pulsa un lugar si lo reconoces. También puedes continuar sin elegir.</p>
              <div className="chip-grid">
                {bodyPlaces.map((place) => (
                  <button key={place} type="button" className={`choice-chip${draft.bodyPlace === place ? " selected" : ""}`} aria-pressed={draft.bodyPlace === place} onClick={() => setDraft({ ...draft, bodyPlace: place })}>{place}</button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <p>Una respiración completa es tomar aire y después soltarlo. Deja que el aire entre y salga naturalmente, sin esfuerzo. Puedes mantener los ojos abiertos.</p>
            <ol className="exercise-steps">
              <li>Apoya los pies en el suelo y acomoda la espalda en la silla.</li>
              <li>Toma aire lentamente, por la nariz si te resulta cómodo. A esto lo llamamos inhalar.</li>
              <li>Suelta el aire con total suavidad y un poco más despacio. Puedes hacerlo por la nariz o por la boca. A esto lo llamamos exhalar.</li>
              <li>Repite cinco veces, sin prisa ni esfuerzo. Puedes seguir tu ritmo y parar cuando quieras.</li>
            </ol>
            <p className="helper-text">Si quieres, pulsa «Iniciar guía de respiración». Las palabras y el círculo te indicarán cuándo tomar y soltar el aire. Si notas mareo o incomodidad, detén la guía y respira como lo haces habitualmente.</p>
            <p className="breathing-status" role="status">{breathing ? `${breathPhase}. Respiración ${breathCycle} de 5.` : seconds === 0 ? "La guía terminó. Puedes seguir a tu ritmo." : "Puedes iniciar la guía o continuar respirando a tu ritmo."}</p>
            <button className="button button-primary" type="button" onClick={startBreathing} disabled={breathing}>
              <Play size={17} /> {seconds === 0 ? "Volver a probar la guía" : breathing ? "Guía en curso" : "Iniciar guía de respiración"}
            </button>
            {breathing ? <button className="button button-quiet" type="button" onClick={stopBreathing}>Detener la guía</button> : null}
            <p className="helper-text" style={{ marginTop: 18 }}>Puedes pulsar «Continuar» cuando quieras, aunque te sientas igual que al comenzar.</p>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="field">
              <span className="field-label">¿Qué te gustaría hacer ahora? (opcional)</span>
              <p className="helper-text">Puedes elegir una o varias ideas, o continuar sin elegir ninguna.</p>
              <div className="chip-grid">
                {releaseOptions.map((option) => (
                  <button key={option} type="button" className={`choice-chip${draft.thoughtsReleased.includes(option) ? " selected" : ""}`} aria-pressed={draft.thoughtsReleased.includes(option)} onClick={() => toggleRelease(option)}>{option}</button>
                ))}
              </div>
            </div>
            <div className="field" style={{ marginTop: 24 }}>
              <label htmlFor="release-note">Algo que quieras recordar (opcional)</label>
              <textarea id="release-note" value={draft.releaseNote} onChange={(event) => setDraft({ ...draft, releaseNote: event.target.value })} placeholder="Hoy noté... / Ahora necesito..." />
            </div>
            <div className="field" style={{ marginTop: 24 }}>
              <span className="field-label">¿Cuánto la notas al terminar?</span>
              <p className="helper-text" id="intensity-after-help">Elige un número como al comenzar. 0: apenas la noto. 10: la siento muy fuerte. Puede ser menor, igual o mayor que antes.</p>
              <div className="range-row">
                <input aria-label="Cuánto noto la emoción al terminar" aria-describedby="intensity-after-help" type="range" min="0" max="10" value={draft.intensityAfter} onChange={(event) => setDraft({ ...draft, intensityAfter: Number(event.target.value) })} />
                <span className="range-value">{draft.intensityAfter}</span>
              </div>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <div>
            <div className="stat-icon"><Check size={22} /></div>
            <p>
              Tu pausa ya está en Mi diario. Allí puedes volver a leer lo que elegiste conservar. Gracias por tomarte este tiempo para ti.
            </p>
            <button className="button button-secondary" type="button" onClick={restart}><RotateCcw size={17} /> Hacer otra pausa</button>
          </div>
        ) : null}

        {step < 4 ? (
          <div className="button-row" style={{ marginTop: 34 }}>
            {step > 0 ? <button className="button button-quiet" type="button" onClick={() => changeStep(step - 1)}><ChevronLeft size={18} /> Volver</button> : null}
            {step < 3 ? (
              <button className="button button-primary" type="button" onClick={() => changeStep(step + 1)} disabled={step === 0 && !draft.feeling}>
                Continuar <ChevronRight size={18} />
              </button>
            ) : (
              <button className="button button-primary" type="button" onClick={finish}><Save size={18} /> Conservar esta pausa en Mi diario</button>
            )}
          </div>
        ) : null}
      </section>

      <aside className="breath-panel">
        <div className="breath-orb-wrap">
          <div className={`breath-orb${breathing ? " active" : ""}`}>
            <strong aria-hidden="true">{breathing ? breathPhase : step === 2 && seconds === 0 ? "A tu ritmo" : "Una pausa"}</strong>
          </div>
          {breathing ? <p>Respiración {breathCycle} de 5</p> : null}
          <p style={{ maxWidth: 320, marginTop: 34, color: "var(--etq-chocolate-suave)" }}>
            {breathing ? "Puedes seguir las palabras del círculo o respirar a tu ritmo. Puedes detener la guía cuando quieras." : "En el paso 3 puedes activar una guía para respirar. Mientras tanto, deja que el aire entre y salga naturalmente."}
          </p>
        </div>
      </aside>
    </div>
  );
}
