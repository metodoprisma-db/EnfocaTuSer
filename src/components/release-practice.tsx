"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, HeartHandshake, Play, RotateCcw, Save } from "lucide-react";

import { useAppState } from "@/context/app-state";

const emotions = ["Miedo", "Tristeza", "Enfado", "Culpa", "Vergüenza", "Desánimo", "Inquietud", "Otra", "Aún no lo sé"];
const bodyPlaces = ["Pecho", "Garganta", "Estómago", "Cabeza", "Espalda", "Mandíbula", "Todo el cuerpo", "Otro lugar", "No noto una zona concreta"];
const releaseOptions = ["Dar un paso a la vez", "Darme tiempo para responder", "Volver al presente", "Hablarme con amabilidad", "Expresar lo que necesito", "Reunir más información"];

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
    "Reconoce cómo estás",
    "Observa lo que sientes",
    "Respira con suavidad",
    "Elige cómo acompañarte",
    "Tu pausa quedó en Mi diario",
  ];
  const elapsed = 40 - seconds;
  const breathCycle = Math.min(5, Math.floor(elapsed / 8) + 1);
  const breathPhase = elapsed % 8 < 4 ? "Inhala lentamente" : "Exhala con suavidad";

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
            <p>Busca una postura cómoda y elige una palabra cercana a cómo estás. Puedes tocar «Aún no lo sé» si todavía no encuentras un nombre.</p>
            <div className="emotion-grid">
              {emotions.map((emotion) => (
                <button key={emotion} type="button" className={`choice-chip${draft.feeling === emotion ? " selected" : ""}`} aria-pressed={draft.feeling === emotion} onClick={() => setDraft({ ...draft, feeling: emotion })}>{emotion}</button>
              ))}
            </div>
            <div className="field" style={{ marginTop: 28 }}>
              <span className="field-label">¿Qué intensidad tiene ahora?</span>
              <p className="helper-text" id="intensity-before-help">Mueve el control hasta el número que se acerque a tu experiencia: 0 es apenas perceptible y 10 es muy intenso. Puedes dejar el valor que aparece si se acerca a cómo estás.</p>
              <div className="range-row">
                <input aria-label="Intensidad inicial" aria-describedby="intensity-before-help" type="range" min="0" max="10" value={draft.intensityBefore} onChange={(event) => setDraft({ ...draft, intensityBefore: Number(event.target.value), intensityAfter: Number(event.target.value) })} />
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
              <label htmlFor="situation">¿Hay una situación que quieras mencionar? (opcional)</label>
              <textarea id="situation" value={draft.situation} onChange={(event) => setDraft({ ...draft, situation: event.target.value })} placeholder="Describe solo lo que te resulte cómodo..." />
            </div>
            <div className="field" style={{ marginTop: 24 }}>
              <span className="field-label">¿En qué parte del cuerpo la notas?</span>
              <p className="helper-text">Puedes notar presión en el pecho, calor en la cara o tensión en los hombros. Elige una zona si la reconoces. También puedes continuar sin elegir.</p>
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
            <p>Deja que el aire entre y salga naturalmente, sin esfuerzo. Puedes mantener los ojos abiertos. Una respiración completa es tomar aire y después soltarlo.</p>
            <ol className="exercise-steps">
              <li>Acomódate y nota los pies sobre el suelo o la espalda apoyada en la silla.</li>
              <li>Inhala lentamente, por la nariz si te resulta cómodo, sin llenar los pulmones al máximo.</li>
              <li>Exhala con suavidad por la nariz o por la boca, como te resulte natural. Deja que la siguiente inhalación llegue a su tiempo.</li>
              <li>Repite unas cinco veces, sin prisa. Puedes hacer menos, seguir tu propio ritmo o detenerte en cualquier momento.</li>
            </ol>
            <p className="helper-text">Si te sirve una referencia visual, el círculo propone cinco respiraciones en unos 40 segundos. Adapta el ritmo a tu comodidad. Si notas mareo o incomodidad, detén la guía y respira como lo haces habitualmente.</p>
            <p className="breathing-status" role="status">{breathing ? `${breathPhase}. Respiración ${breathCycle} de 5.` : seconds === 0 ? "La guía terminó. Puedes seguir a tu ritmo." : "Puedes iniciar la guía o continuar respirando a tu ritmo."}</p>
            <button className="button button-primary" type="button" onClick={startBreathing} disabled={breathing}>
              <Play size={17} /> {seconds === 0 ? "Volver a probar la guía" : breathing ? "Guía en curso" : "Iniciar guía de respiración"}
            </button>
            {breathing ? <button className="button button-quiet" type="button" onClick={stopBreathing}>Detener la guía</button> : null}
            <p className="helper-text" style={{ marginTop: 18 }}>Toca «Continuar» cuando quieras, incluso si te sientes igual o prefieres seguir sin la guía.</p>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="field">
              <span className="field-label">¿Qué te gustaría ofrecerte ahora? (opcional)</span>
              <p className="helper-text">Puedes elegir una o varias ideas, o continuar sin seleccionar ninguna.</p>
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
              <span className="field-label">¿Qué intensidad sientes al cerrar?</span>
              <p className="helper-text" id="intensity-after-help">Usa la misma escala: 0 es apenas perceptible y 10 es muy intenso. El valor puede ser menor, igual o mayor. Elige lo que se acerque a cómo estás ahora.</p>
              <div className="range-row">
                <input aria-label="Intensidad al cerrar" aria-describedby="intensity-after-help" type="range" min="0" max="10" value={draft.intensityAfter} onChange={(event) => setDraft({ ...draft, intensityAfter: Number(event.target.value) })} />
                <span className="range-value">{draft.intensityAfter}</span>
              </div>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <div>
            <div className="stat-icon"><Check size={22} /></div>
            <p>
              Encontrarás esta pausa en Mi diario, con la emoción y las palabras que elegiste conservar. Puedes volver a leerla cuando quieras. Gracias por dedicarte este momento.
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
            {breathing ? "Sigue las palabras del círculo solo si ese ritmo te resulta cómodo. Puedes respirar a tu manera y detener la guía cuando quieras." : "El círculo acompaña la guía del paso 3. Mientras tanto, deja que el aire entre y salga naturalmente, sin esfuerzo."}
          </p>
        </div>
      </aside>
    </div>
  );
}
