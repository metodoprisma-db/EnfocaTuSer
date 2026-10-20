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
import {
  ASSETS,
  MEMBERSHIP_CHECKOUT_URL,
  SUPPORT_URL,
} from "@/lib/constants";

export function MembershipTransition() {
  const { state, actions } = useAppState();
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
        <span className="eyebrow">Tu recorrido sigue siendo tuyo</span>
        <h1>Tu pase llegó a una pausa amable</h1>
        <p>
          Puedes guardar una copia completa de tu diario ahora mismo. Cuando quieras continuar,
          activa tu membresía o vincula el correo que usaste en la compra.
        </p>

        <div className="membership-actions">
          <button className="button button-secondary" type="button" onClick={actions.exportData}>
            <Download size={18} /> Descargar mi diario en JSON
          </button>
          <a className="button button-primary" href={MEMBERSHIP_CHECKOUT_URL} target="_blank" rel="noreferrer">
            <CreditCard size={18} /> Activar mi membresía
          </a>
        </div>

        <form className="billing-email-form" onSubmit={claimEmail}>
          <div>
            <span className="eyebrow"><MailCheck size={15} /> ¿Compraste con otro correo?</span>
            <h2>Vincula tu correo de compra</h2>
            <p>Solo puede estar asociado a una cuenta de Enfoca Tu Ser.</p>
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
