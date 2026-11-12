"use client";

import Link from "next/link";
import { ArrowRight, BookHeart, CalendarHeart, Footprints, Sparkles } from "lucide-react";

import { AnnouncementBanner } from "@/components/announcement-banner";
import { ContinuationInvitation } from "@/components/continuation-invitation";
import { GiftCard } from "@/components/gift-card";
import { IntegrationInvitation } from "@/components/integration-invitation";
import { JourneyAssessment } from "@/components/journey-assessment";
import { AvailabilityNotice, NotificationPreferences } from "@/components/notification-preferences";
import { useAppState } from "@/context/app-state";
import { discoveries } from "@/data/catalog";

export default function HomePage() {
  const { state, actions, meta } = useAppState();
  const nextIndex = meta.progression.nextDiscoveryIndex;
  const nextDiscovery = nextIndex === null ? null : discoveries[nextIndex];
  const invitationIndex = meta.progression.activeInvitationIndex;
  const activeInvitation = invitationIndex === null ? null : discoveries[invitationIndex];

  return (
    <div className="page-wrap home-page">
      <AnnouncementBanner />
      <AvailabilityNotice />

      {state.rhythmResumed ? (
        <aside className="rhythm-return" aria-live="polite">
          <CalendarHeart size={21} />
          <div>
            <strong>Tomaste un respiro, hoy retomamos tu ritmo</strong>
            <span>Tus {state.data.profile.presenceDaysCount} días de presencia siguen contigo.</span>
          </div>
          <button type="button" onClick={actions.dismissRhythmMessage}>Entendido</button>
        </aside>
      ) : null}

      <header className="welcome-header">
        <span className="eyebrow">{meta.initialAssessment ? "Mi espacio" : "Tu camino empieza aquí"}</span>
        <h1>{meta.initialAssessment
          ? state.data.profile.displayName ? `Qué bueno que regresaste, ${state.data.profile.displayName}` : "Qué bueno que regresaste"
          : "Bienvenida, puedes empezar tal como estás"}</h1>
        <p>{meta.initialAssessment
          ? "Observa qué está disponible y elige cómo acompañarte hoy. Puedes retomar el recorrido o dedicarte una pausa breve."
          : "Comienza con cuatro preguntas sobre cómo te sientes. Las llamamos fotografía inicial: se responden con números, sin usar la cámara. Al completarlas podrás abrir «Empieza sin prisa», con un primer ejercicio de alrededor de un minuto."}</p>
      </header>

      {!meta.initialAssessment ? (
        <JourneyAssessment stage="initial" />
      ) : activeInvitation ? (
        <section className="home-focus" aria-labelledby="home-focus-title">
          <div className="focus-intro">
            <span className="eyebrow">Tu momento presente</span>
            <h2 id="home-focus-title">Deja que lo recorrido encuentre su lugar</h2>
            <p>Puedes seguir con tu día. Si te apetece, esta propuesta te acompaña fuera de la pantalla; es opcional y puedes dejarla pasar.</p>
          </div>
          <IntegrationInvitation item={activeInvitation} nextUnlockAt={meta.progression.nextUnlockAt} />
        </section>
      ) : (
        <section className="home-focus focus-ready" aria-labelledby="home-focus-title">
          <div className="focus-intro">
            <span className="eyebrow">{meta.pathComplete ? "Tu camino completo" : "Cuando quieras continuar"}</span>
            <h2 id="home-focus-title">{meta.pathComplete ? "Todo lo que caminaste ya puede mirarse" : nextDiscovery?.title}</h2>
            <p>{meta.pathComplete ? "Tus dos miradas, tus pausas y tus reflexiones cuentan una historia propia." : nextDiscovery?.description}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href={meta.pathComplete ? "/camino" : `/camino/discovery/${nextDiscovery?.slug}`}>
                {meta.pathComplete ? "Mirar mi recorrido" : "Abrir mi descubrimiento"} <ArrowRight size={18} />
              </Link>
              <Link className="button button-secondary" href="/soltar"><Sparkles size={18} /> Hacer una pausa breve</Link>
            </div>
          </div>
          <div className="focus-number" aria-hidden="true">{meta.pathComplete ? "15" : String((nextIndex ?? 0) + 1).padStart(2, "0")}</div>
        </section>
      )}

      <section className="quiet-actions" aria-label="Otros espacios disponibles">
        <Link href="/camino"><Footprints size={20} /><span><strong>Mi camino</strong><small>Revisita lo que ya recorriste</small></span></Link>
        <Link href="/diario"><BookHeart size={20} /><span><strong>Mi diario</strong><small>Escribe o vuelve a tus notas</small></span></Link>
        <Link href="/soltar"><Sparkles size={20} /><span><strong>Soltar ahora</strong><small>Regálate una pausa breve</small></span></Link>
      </section>

      <details className="home-details">
        <summary>Cómo usar tu espacio, paso a paso</summary>
        <ol className="exercise-steps">
          <li>En «Mi camino» encontrarás los quince descubrimientos en orden. Lee uno, prueba el ejercicio y toca «Completar» cuando termines por hoy. La fecha del siguiente paso aparecerá en Mi espacio.</li>
          <li>Entre descubrimientos puedes cerrar la aplicación y seguir con tu día. La propuesta «Llévalo contigo» es opcional y no cambia la apertura del siguiente paso.</li>
          <li>«Soltar ahora» ofrece una pausa guiada. «Mi diario» permite escribir y volver a tus notas. En «Brújula» puedes elegir una emoción y leer una orientación. Estos espacios están disponibles durante el recorrido.</li>
          <li>Al completar cinco descubrimientos se abre una charla de 30 minutos con Clarissa y Scarlett. Encontrarás aquí el botón para coordinarla con el equipo.</li>
        </ol>
      </details>

      <ContinuationInvitation />

      <details className="home-details">
        <summary>Tus huellas y preferencias</summary>
        <div className="home-secondary-grid">
          <section className="compact-stats" aria-label="Huellas de presencia">
            <div><strong>{meta.stats.discoveriesCompleted}</strong><span>descubrimientos</span></div>
            <div><strong>{state.data.profile.presenceDaysCount}</strong><span>días de presencia</span></div>
            <div><strong>{meta.stats.pausesCompleted}</strong><span>pausas</span></div>
            <div><strong>{meta.stats.journalEntries}</strong><span>notas</span></div>
          </section>
          <NotificationPreferences />
        </div>
      </details>

      {meta.giftUnlocked ? <section className="section gift-secondary"><GiftCard /></section> : null}
    </div>
  );
}
