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
            <span>Ya has entrado {state.data.profile.presenceDaysCount} días distintos. Puedes seguir desde donde te quedaste.</span>
          </div>
          <button type="button" onClick={actions.dismissRhythmMessage}>Entendido</button>
        </aside>
      ) : null}

      <header className="welcome-header">
        <span className="eyebrow">{meta.initialAssessment ? "Mi espacio" : "Tu camino empieza aquí"}</span>
        <h1>{meta.initialAssessment
          ? state.data.profile.displayName ? `Qué bueno que regresaste, ${state.data.profile.displayName}` : "Qué bueno que regresaste"
          : "Bienvenida. Este momento es para ti"}</h1>
        <p>{meta.initialAssessment
          ? "Puedes abrir tu próximo ejercicio o elegir una pausa para respirar. Hazlo con cariño hacia ti y a tu ritmo."
          : "Para empezar, responde cuatro preguntas sobre cómo te sientes. Después podrás abrir tu primer ejercicio: «Empieza sin prisa»."}</p>
      </header>

      {!meta.initialAssessment ? (
        <JourneyAssessment stage="initial" />
      ) : activeInvitation ? (
        <section className="home-focus" aria-labelledby="home-focus-title">
          <div className="focus-intro">
            <span className="eyebrow">Después del ejercicio de hoy</span>
            <h2 id="home-focus-title">Puedes seguir con tu día</h2>
            <p>Si quieres, prueba la idea de abajo durante tus actividades. Puedes hacerlo sin usar la aplicación.</p>
          </div>
          <IntegrationInvitation item={activeInvitation} nextUnlockAt={meta.progression.nextUnlockAt} />
        </section>
      ) : (
        <section className="home-focus focus-ready" aria-labelledby="home-focus-title">
          <div className="focus-intro">
            <span className="eyebrow">{meta.pathComplete ? "Tu camino completo" : "Cuando quieras continuar"}</span>
            <h2 id="home-focus-title">{meta.pathComplete ? "Completaste los quince descubrimientos" : nextDiscovery?.title}</h2>
            <p>{meta.pathComplete ? "Puedes volver a leerlos, consultar tus notas y elegir una de las doce prácticas para seguir usando lo que aprendiste." : nextDiscovery?.description}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href={meta.pathComplete ? "/camino" : `/camino/discovery/${nextDiscovery?.slug}`}>
                {meta.pathComplete ? "Ver mis ejercicios" : "Abrir mi descubrimiento"} <ArrowRight size={18} />
              </Link>
              <Link className="button button-secondary" href="/soltar"><Sparkles size={18} /> Hacer una pausa breve</Link>
            </div>
          </div>
          <div className="focus-number" aria-hidden="true">{meta.pathComplete ? "15" : String((nextIndex ?? 0) + 1).padStart(2, "0")}</div>
        </section>
      )}

      <section className="quiet-actions" aria-label="Otros espacios disponibles">
        <Link href="/camino"><Footprints size={20} /><span><strong>Mi camino</strong><small>Ver mis ejercicios</small></span></Link>
        <Link href="/diario"><BookHeart size={20} /><span><strong>Mi diario</strong><small>Escribe o vuelve a tus notas</small></span></Link>
        <Link href="/soltar"><Sparkles size={20} /><span><strong>Soltar ahora</strong><small>Respirar y reconocer cómo estás</small></span></Link>
      </section>

      <details className="home-details">
        <summary>Cómo usar tu espacio, paso a paso</summary>
        <ol className="exercise-steps">
          <li>En «Mi camino» hay quince descubrimientos, cada uno con un ejercicio. Ábrelos en orden. Al terminar uno, pulsa «Completar».</li>
          <li>Después habrá un tiempo de espera. Puedes cerrar la aplicación: el siguiente se abrirá a la hora indicada. La idea «Llévalo contigo» es opcional.</li>
          <li>Mientras esperas, puedes usar «Soltar ahora» para respirar, «Mi diario» para escribir o «Brújula» para leer una idea sobre cómo te sientes.</li>
          <li>Al completar cinco descubrimientos se abre una charla de 30 minutos con Clarissa y Scarlett. Encontrarás aquí el botón para coordinarla con el equipo.</li>
        </ol>
      </details>

      <ContinuationInvitation />

      <details className="home-details">
        <summary>Tu actividad y tus avisos</summary>
        <div className="home-secondary-grid">
          <section className="compact-stats" aria-label="Huellas de presencia">
            <div><strong>{meta.stats.discoveriesCompleted}</strong><span>descubrimientos</span></div>
            <div><strong>{state.data.profile.presenceDaysCount}</strong><span>días de presencia</span></div>
            <div><strong>{meta.stats.pausesCompleted}</strong><span>pausas</span></div>
            <div><strong>{meta.stats.journalEntries}</strong><span>notas</span></div>
          </section>
          <NotificationPreferences />
        </div>
        <p className="helper-text">Los días de presencia son los días distintos en que entraste a la aplicación.</p>
      </details>

      {meta.giftUnlocked ? <section className="section gift-secondary"><GiftCard /></section> : null}
    </div>
  );
}
