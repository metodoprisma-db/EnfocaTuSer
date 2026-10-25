import type { Metadata } from "next";
import Image from "next/image";
import { HeartHandshake, ShieldCheck } from "lucide-react";

import { ASSETS } from "@/lib/constants";

export const metadata: Metadata = { title: "Sobre este camino" };

export default function SobrePage() {
  return (
    <div className="page-wrap">
      <header className="page-header">
        <span className="eyebrow">Enfoca Tu Ser</span>
        <h1>Un camino sostenido por personas reales</h1>
        <p>
          Clarissa Acevedo y Scarlett Vargas crearon este espacio para acompañarte a pasar de la exigencia del hacer y tener hacia una relación más consciente con tu ser.
        </p>
      </header>

      <section className="story-grid">
        <div className="story-photo">
          <Image src={ASSETS.mentors} fill sizes="(max-width: 820px) 90vw, 34vw" alt="Clarissa Acevedo y Scarlett Vargas" />
        </div>
        <div className="story-copy">
          <span className="eyebrow"><HeartHandshake size={15} /> Nuestra intención</span>
          <h2>Quitar capas para volver al centro</h2>
          <p>
            Enfoca Tu Ser nace de una certeza sencilla: detrás de muchas metas, responsabilidades y luchas existe una mujer que desea sentirse en paz consigo misma.
          </p>
          <p>
            Sus historias, su sensibilidad y su mirada práctica se encuentran en una forma cercana de escuchar y sostener cada paso con humanidad.
          </p>
          <p>
            En este camino, las preguntas, pausas y descubrimientos ayudan a reconocer la emoción sin convertirla en identidad. Aquí no se trata de rendir ni de llegar antes. Se trata de mirarte con más verdad y elegir desde allí.
          </p>
          <div className="mentor-note" style={{ marginTop: 28 }}>
            <Image src={ASSETS.mentors} width={104} height={104} alt="Clarissa Acevedo y Scarlett Vargas juntas" />
            <p><strong style={{ color: "var(--etq-chocolate)" }}>Clarissa y Scarlett</strong><br />Cerca de ti, paso a paso.</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="ethics-title">
        <div className="ethics-card">
          <ShieldCheck size={28} color="var(--etq-terracota)" style={{ flex: "0 0 auto" }} />
          <div>
            <h3 id="ethics-title">Un aviso de cuidado</h3>
            <p style={{ marginBottom: 0 }}>
              Este espacio ofrece reflexión y acompañamiento educativo. No reemplaza atención médica, psicológica ni servicios de emergencia. Si una emoción se vuelve difícil de sostener o existe riesgo para tu seguridad, busca apoyo profesional y cercano en tu localidad.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
