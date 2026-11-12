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
              Conversa directamente con nosotras. Puedes contarnos qué ejercicio probaste y cómo te fue,
              o preguntar cómo hacerlo en una situación de tu día. Te escucharemos y pensaremos contigo
              qué podrías probar después.
            </p>
            <p>Si quieres, prepara un té o café. Tú eliges qué compartir. Al pulsar el botón se abrirá la página para acordar la charla con nuestro equipo.</p>
            <a className="button button-primary" href={GIFT_CHAT_URL} target="_blank" rel="noreferrer">
              <CalendarHeart size={18} /> Coordinar mi charla con el equipo de Enfoca Tu Ser
            </a>
          </>
        ) : (
          <>
            <h3>Una charla para contar cómo te va y hacer preguntas</h3>
            <p>
              Al completar el quinto descubrimiento tendrás disponible una charla de 30 minutos con Clarissa y Scarlett.
              Podrás contarnos cómo te va, hacer preguntas sobre los ejercicios y pensar con nosotras qué quieres seguir practicando.
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
