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
      <span className="eyebrow">{closing ? "Para decidir cómo seguir" : "Durante tu prueba gratuita"}</span>
      <h2 id="continuation-title">{closing ? "¿Quieres seguir con los ejercicios?" : "Prueba un ejercicio a la vez"}</h2>
      <p>{closing
        ? "Piensa qué ejercicio te sirvió y cuál te gustaría repetir. Puedes volver a tus notas para recordar lo que probaste y decidir si quieres continuar."
        : "Lee los pasos y prueba los ejercicios a tu ritmo. Observa cuáles te sirven durante el día. Los quince descubrimientos pueden llevar más tiempo que los días de prueba."}</p>
      <p>Para seguir usando la aplicación después de la prueba, puedes pagar {membershipOffer.priceLabel}. Antes de pagar podrás leer las condiciones y decidir.</p>
      {accessUntil && Number.isFinite(accessTimestamp) ? <p className="helper-text">Fecha de finalización de tu prueba: {formatLocalMoment(accessUntil)}, según el horario de este dispositivo.</p> : null}
      {closing && meta.giftUnlocked ? <p><CalendarHeart size={18} aria-hidden="true" /> Tu charla de 30 minutos con Clarissa y Scarlett está disponible. Puedes contarnos qué probaste y preguntar cómo usar un ejercicio en una situación de tu día. Más abajo está el botón para coordinarla.</p> : null}
      <div className="button-row">
        <a className="button button-secondary" href={MEMBERSHIP_CHECKOUT_URL} target="_blank" rel="noreferrer">
          {HAS_MEMBERSHIP_CHECKOUT ? `Conocer la membresía: ${membershipOffer.priceLabel}` : "Consultar cómo continuar"} <ArrowRight size={17} />
        </a>
        <Link className="button button-quiet" href="/diario">Volver a mis notas</Link>
      </div>
    </section>
  );
}
