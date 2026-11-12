"use client";

import Link from "next/link";
import { ArrowRight, CalendarHeart } from "lucide-react";

import { useAppState } from "@/context/app-state";
import { membershipOffer } from "@/data/membership-offer";
import { HAS_MEMBERSHIP_CHECKOUT, MEMBERSHIP_CHECKOUT_URL } from "@/lib/constants";
import { formatLocalMoment } from "@/components/integration-invitation";

export function ContinuationInvitation() {
  const { state, meta } = useAppState();
  if (!state.user || state.data.profile.planType !== "trial") return null;

  const accessUntil = state.data.profile.accessUntil;
  const accessTimestamp = accessUntil ? Date.parse(accessUntil) : NaN;
  const closing = Number.isFinite(accessTimestamp) && meta.currentTimestamp !== null &&
    accessTimestamp - meta.currentTimestamp <= 24 * 60 * 60 * 1000;

  return (
    <section className="surface-card continuation-card" aria-labelledby="continuation-title">
      <span className="eyebrow">{closing ? "Una invitación a continuar" : "Tu tiempo para conocer este espacio"}</span>
      <h2 id="continuation-title">{closing ? "¿Qué te gustaría seguir explorando?" : "Haz lugar a un momento para ti"}</h2>
      <p>{closing
        ? "Puedes preguntarte qué pausa, frase o ejercicio te resultó útil y qué te gustaría seguir practicando. Tu propia experiencia puede orientarte para elegir cómo continuar."
        : "Prueba una pausa breve, escucha las indicaciones y elige qué recursos te acompañan en tu día. Los quince descubrimientos tienen su propio ritmo; puedes recorrerlos sin ajustarlos al calendario de la prueba."}</p>
      <p>Al terminar tu pase, puedes elegir continuar por {membershipOffer.priceLabel}. En la página de pago podrás revisar las condiciones antes de decidir.</p>
      {accessUntil && Number.isFinite(accessTimestamp) ? <p className="helper-text">Fecha de finalización de tu prueba: {formatLocalMoment(accessUntil)}, según el horario de este dispositivo.</p> : null}
      {closing && meta.giftUnlocked ? <p><CalendarHeart size={18} aria-hidden="true" /> También tienes disponible tu charla de 30 minutos con Clarissa y Scarlett: puedes compartir una experiencia, aclarar una duda y explorar juntas un siguiente paso. Encontrarás la invitación más abajo.</p> : null}
      <div className="button-row">
        <a className="button button-secondary" href={MEMBERSHIP_CHECKOUT_URL} target="_blank" rel="noreferrer">
          {HAS_MEMBERSHIP_CHECKOUT ? `Conocer la membresía: ${membershipOffer.priceLabel}` : "Consultar cómo continuar"} <ArrowRight size={17} />
        </a>
        <Link className="button button-quiet" href="/diario">Volver a mis notas</Link>
      </div>
    </section>
  );
}
