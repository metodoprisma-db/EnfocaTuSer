"use client";

import Link from "next/link";
import { ArrowRight, BookHeart, CalendarHeart, Footprints, Sparkles } from "lucide-react";

import { AnnouncementBanner } from "@/components/announcement-banner";
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
          ? state.data.profile.displayName ? `Qué bueno verte, ${state.data.profile.displayName}` : "Qué bueno que volviste"
          : "Antes de avanzar, detente a mirar cómo estás"}</h1>
        <p>{meta.initialAssessment
          ? "Este momento no pide prisa. Mira lo que está disponible y elige cómo quieres acompañarte hoy."
          : "La fotografía inicial te ayudará a reconocer tu punto de partida y, al final, a hacer visible el recorrido. Cuando la guardes, el Descubrimiento 01 se abrirá de inmediato."}</p>
      </header>

      {!meta.initialAssessment ? (
        <JourneyAssessment stage="initial" />
      ) : activeInvitation ? (
        <section className="home-focus" aria-labelledby="home-focus-title">
          <div className="focus-intro">
            <span className="eyebrow">Tu momento presente</span>
            <h2 id="home-focus-title">Deja que lo recorrido encuentre su lugar</h2>
            <p>El trabajo de hoy continúa en la vida cotidiana. No hace falta volver a la pantalla ni registrar nada durante este tiempo.</p>
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
              <Link className="button button-secondary" href="/soltar"><Sparkles size={18} /> Necesito soltar algo</Link>
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
