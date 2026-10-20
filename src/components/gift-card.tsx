"use client";

import Image from "next/image";
import { CalendarHeart, Gift, LockKeyhole } from "lucide-react";

import { useAppState } from "@/context/app-state";
import { ASSETS, GIFT_CHAT_URL } from "@/lib/constants";

export function GiftCard() {
  const { meta } = useAppState();
  const completed = Math.min(meta.stats.discoveriesCompleted, 5);

  return (
    <article className="gift-card">
      <div className="mentor-avatar-large">
        <Image src={ASSETS.mentors} width={192} height={192} alt="Clarissa Acevedo y Scarlett Vargas" />
      </div>
      <div className="gift-content">
        <span className="eyebrow"><Gift size={15} /> Un regalo de Clarissa y Scarlett</span>
        {meta.giftUnlocked ? (
          <>
            <h3>Una charla cercana de 30 minutos con Clarissa y Scarlett</h3>
            <p>
              Un encuentro de mujer a mujer, con té o café virtual, para escucharte con confidencialidad,
              ordenar lo que sientes y acompañarte a reconocer tu siguiente paso en paz.
            </p>
            <a className="button button-primary" href={GIFT_CHAT_URL} target="_blank" rel="noreferrer">
              <CalendarHeart size={18} /> Coordinar mi charla con el equipo de Enfoca Tu Ser
            </a>
          </>
        ) : (
          <>
            <h3>Tu encuentro especial vive en el paso 6</h3>
            <p>
              Al completar cinco descubrimientos se abrirá una charla cercana con nosotras. Avanza a tu ritmo:
              este regalo reconoce tu presencia, no una carrera.
            </p>
            <div className="gift-steps" aria-label={`${completed} de 5 pasos para abrir el regalo`}>
              {[1, 2, 3, 4, 5].map((step) => (
                <span key={step} className={`gift-step${completed >= step ? " done" : ""}`}>{step}</span>
              ))}
              <span className="gift-step gift" title="Regalo en el paso 6"><Gift size={16} aria-hidden="true" /></span>
            </div>
            <p className="helper-text" style={{ marginTop: 12, marginBottom: 0 }}>
              <LockKeyhole size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
              Faltan {5 - completed} descubrimientos para abrirlo.
            </p>
          </>
        )}
      </div>
    </article>
  );
}
