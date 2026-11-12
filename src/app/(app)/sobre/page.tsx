import type { Metadata } from "next";
import Image from "next/image";
import { HeartHandshake, ShieldCheck } from "lucide-react";

import { ASSETS } from "@/lib/constants";
import { membershipOffer } from "@/data/membership-offer";

export const metadata: Metadata = { title: "Sobre este camino" };

export default function SobrePage() {
  return (
    <div className="page-wrap">
      <header className="page-header">
        <span className="eyebrow">Enfoca Tu Ser</span>
        <h1>Un camino sostenido por personas reales</h1>
        <p>
          Clarissa Acevedo y Scarlett Vargas crearon este espacio para acompañarte a reconocer lo que sientes, escucharte con amabilidad y explorar pasos posibles en tu vida cotidiana.
        </p>
      </header>

      <section className="story-grid">
        <div className="story-photo">
          <Image src={ASSETS.mentors} fill sizes="(max-width: 820px) 90vw, 34vw" alt="Clarissa Acevedo y Scarlett Vargas" />
        </div>
        <div className="story-copy">
          <span className="eyebrow"><HeartHandshake size={15} /> Nuestra intención</span>
          <h2>Escucharte puede abrir una posibilidad</h2>
          <p>
            Entre las tareas, los vínculos y las responsabilidades de cada día, puedes hacer lugar a un momento para ti. Enfoca Tu Ser te propone pausas, preguntas y ejercicios sencillos para conocer qué necesitas y elegir cómo acompañarte.
          </p>
          <p>
            Clarissa y Scarlett reúnen su experiencia y su mirada práctica en un recorrido pensado para que puedas seguirlo por tu cuenta. Cada ejercicio incluye indicaciones y ejemplos. Puedes adaptar la postura, mantener los ojos abiertos y detenerte cuando lo necesites.
          </p>
          <p>
            Quizá una pausa te ayude a reconocer una emoción, una frase te ofrezca otra perspectiva o una pregunta quede abierta. Puedes observar tu experiencia a tu ritmo y conservar los recursos que te resulten útiles.
          </p>
          <div className="mentor-note" style={{ marginTop: 28 }}>
            <Image src={ASSETS.mentors} width={104} height={104} alt="Clarissa Acevedo y Scarlett Vargas juntas" />
            <p><strong style={{ color: "var(--etq-chocolate)" }}>Clarissa y Scarlett</strong><br />Cerca de ti, paso a paso.</p>
          </div>
        </div>
      </section>

      <section className="section surface-card">
        <span className="eyebrow">Conocer este espacio y elegir cómo seguir</span>
        <h2>{membershipOffer.trialLabel} para explorar a tu ritmo</h2>
        <p>{membershipOffer.continuation} Puedes revisar las condiciones en la página de pago antes de elegir.</p>
        <p>Los quince descubrimientos siguen una secuencia con tiempo de integración entre pasos. Los siete días de prueba son tiempo de acceso y no una fecha para completar el recorrido. Al completar el quinto descubrimiento tendrás disponible una charla de 30 minutos con Clarissa y Scarlett para compartir tu experiencia y explorar juntas un siguiente paso.</p>
      </section>

      <section className="section" aria-labelledby="ethics-title">
        <div className="ethics-card">
          <ShieldCheck size={28} color="var(--etq-terracota)" style={{ flex: "0 0 auto" }} />
          <div>
            <h3 id="ethics-title">Tu cuidado también incluye pedir apoyo</h3>
            <p style={{ marginBottom: 0 }}>
              Este espacio ofrece reflexión y acompañamiento educativo. No reemplaza atención médica, psicológica ni servicios de emergencia. Si una emoción se vuelve difícil de sostener o existe riesgo para tu seguridad, busca apoyo profesional y cercano en tu localidad.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
