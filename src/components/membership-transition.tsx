"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import {
  CreditCard,
  Download,
  MailCheck,
  MessageCircleHeart,
} from "lucide-react";

import { useAppState } from "@/context/app-state";
import { GiftCard } from "@/components/gift-card";
import { membershipOffer } from "@/data/membership-offer";
import {
  ASSETS,
  HAS_MEMBERSHIP_CHECKOUT,
  MEMBERSHIP_CHECKOUT_URL,
  SUPPORT_URL,
} from "@/lib/constants";

export function MembershipTransition() {
  const { state, actions, meta } = useAppState();
  const [billingEmail, setBillingEmail] = useState(
    state.data.profile.billingEmail ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const claimEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);
    try {
      const claimed = await actions.claimBillingEmail(billingEmail);
      setBillingEmail(claimed);
      setSuccess(true);
      setMessage("Tu correo de compra quedó vinculado de forma segura.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos vincular el correo de compra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="membership-transition">
      <section className="membership-card">
        <Image src={ASSETS.mark} width={90} height={90} alt="Isotipo de Enfoca Tu Ser" />
        <span className="eyebrow">Elige cómo quieres seguir</span>
        <h1>Puedes elegir cómo continuar</h1>
        <p>
          Tu período de acceso terminó. Puedes pensar qué ejercicios te sirvieron y si quieres seguir practicando.
          La membresía te permite seguir usando la aplicación y volver a los ejercicios.
        </p>
        <p>Puedes continuar por {membershipOffer.priceLabel}. Antes de pagar podrás leer las condiciones y decidir si quieres seguir.</p>

        <div className="membership-actions">
          <button className="button button-secondary" type="button" onClick={actions.exportData}>
            <Download size={18} /> Descargar una copia de mi diario
          </button>
          <a className="button button-primary" href={MEMBERSHIP_CHECKOUT_URL} target="_blank" rel="noreferrer">
            <CreditCard size={18} /> {HAS_MEMBERSHIP_CHECKOUT ? `Continuar por ${membershipOffer.priceLabel}` : "Consultar cómo continuar"}
          </a>
        </div>
        <p className="helper-text">Al pulsar «Descargar», se guardará un archivo con tus notas en este dispositivo. El formato se llama JSON. Puedes descargarlo aunque decidas continuar más adelante.</p>

        {meta.giftUnlocked ? <GiftCard /> : null}

        <form className="billing-email-form" onSubmit={claimEmail}>
          <div>
            <span className="eyebrow"><MailCheck size={15} /> ¿Compraste con otro correo?</span>
            <h2>Vincula tu correo de compra</h2>
            <p>Si ya pagaste con una dirección distinta, puedes vincularla a esta cuenta para que podamos reconocer tu compra. Si todavía no compraste, puedes dejar este formulario sin completar.</p>
          </div>
          <div className="field">
            <label htmlFor="billing-email">Correo usado en la compra</label>
            <input
              id="billing-email"
              type="email"
              autoComplete="email"
              value={billingEmail}
              onChange={(event) => setBillingEmail(event.target.value)}
              required
            />
          </div>
          <button className="button button-secondary" type="submit" disabled={loading}>
            <MailCheck size={17} /> {loading ? "Vinculando..." : "Vincular correo de compra"}
          </button>
          {message ? <p className={`form-message${success ? " success" : ""}`} role="status">{message}</p> : null}
        </form>

        <a className="support-link" href={SUPPORT_URL} target="_blank" rel="noreferrer">
          <MessageCircleHeart size={18} /> Escribe aquí y nuestro equipo te ayudará con gusto
        </a>
      </section>
    </div>
  );
}
