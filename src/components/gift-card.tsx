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
              Un encuentro directo con las dos creadoras de este espacio. Puedes traer una experiencia
              de los ejercicios, una pregunta o algo que te gustaría comprender mejor. Te escucharemos
              y exploraremos contigo un siguiente paso que tenga sentido para ti.
            </p>
            <p>Si te apetece, prepara un té o café. Puedes conversar tal como estás y elegir qué compartir. Al tocar el botón se abrirá la página para coordinar la charla con nuestro equipo.</p>
            <a className="button button-primary" href={GIFT_CHAT_URL} target="_blank" rel="noreferrer">
              <CalendarHeart size={18} /> Coordinar mi charla con el equipo de Enfoca Tu Ser
            </a>
          </>
        ) : (
          <>
            <h3>Un espacio para conversar sobre tu experiencia</h3>
            <p>
              Al completar el quinto descubrimiento tendrás disponible una charla de 30 minutos con Clarissa y Scarlett.
              Podrás aclarar dudas de los ejercicios, compartir lo que vas notando y explorar cómo seguir con apoyo cercano.
            </p>
            <div className="gift-steps" aria-label={`${completed} de 5 pasos para abrir el regalo`}>
              {[1, 2, 3, 4, 5].map((step) => (
                <span key={step} className={`gift-step${completed >= step ? " done" : ""}`}>{step}</span>
              ))}
              <span className="gift-step gift" title="Charla disponible al completar el quinto descubrimiento"><Gift size={16} aria-hidden="true" /></span>
            </div>
            <p className="helper-text" style={{ marginTop: 12, marginBottom: 0 }}>
              <LockKeyhole size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
              Estará disponible después del quinto descubrimiento. Puedes avanzar a tu ritmo.
            </p>
          </>
        )}
      </div>
    </article>
  );
}
