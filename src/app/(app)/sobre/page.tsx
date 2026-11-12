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
        <h1>Clarissa y Scarlett te acompañan</h1>
        <p>
          Clarissa Acevedo y Scarlett Vargas crearon Enfoca Tu Ser para ayudarte a reconocer lo que sientes, respirar con calma y elegir qué quieres hacer después.
        </p>
      </header>

      <section className="story-grid">
        <div className="story-photo">
          <Image src={ASSETS.mentors} fill sizes="(max-width: 820px) 90vw, 34vw" alt="Clarissa Acevedo y Scarlett Vargas" />
        </div>
        <div className="story-copy">
          <span className="eyebrow"><HeartHandshake size={15} /> Nuestra intención</span>
          <h2>Ejercicios para escuchar cómo estás</h2>
          <p>
            Puedes dedicarte unos minutos entre tus actividades. Encontrarás preguntas para pensar, pausas para respirar y ejercicios para reconocer qué necesitas.
          </p>
          <p>
            Cada ejercicio tiene indicaciones y ejemplos para que puedas hacerlo por tu cuenta. Puedes mantener los ojos abiertos, elegir una postura cómoda y parar cuando quieras.
          </p>
          <p>
            Si un ejercicio te sirve, puedes repetirlo durante el día. También puedes escribir una nota para recordar lo que probaste o una pregunta que quieras hacer.
          </p>
          <div className="mentor-note" style={{ marginTop: 28 }}>
            <Image src={ASSETS.mentors} width={104} height={104} alt="Clarissa Acevedo y Scarlett Vargas juntas" />
            <p><strong style={{ color: "var(--etq-chocolate)" }}>Clarissa y Scarlett</strong><br />Cerca de ti, paso a paso.</p>
          </div>
        </div>
      </section>

      <section className="section surface-card">
        <span className="eyebrow">Prueba los ejercicios y decide si quieres seguir</span>
        <h2>{membershipOffer.trialLabel} para conocer la aplicación</h2>
        <p>{membershipOffer.continuation} Puedes revisar las condiciones en la página de pago antes de elegir.</p>
        <p>Los quince descubrimientos se abren en orden, con una espera entre uno y otro. Puedes dedicarles más tiempo que los días de prueba. Al completar el quinto, podrás coordinar una charla de 30 minutos con Clarissa y Scarlett para contarnos cómo te va y hacer preguntas.</p>
      </section>

      <section className="section" aria-labelledby="ethics-title">
        <div className="ethics-card">
          <ShieldCheck size={28} color="var(--etq-terracota)" style={{ flex: "0 0 auto" }} />
          <div>
            <h3 id="ethics-title">Puedes pedir más ayuda cuando la necesites</h3>
            <p style={{ marginBottom: 0 }}>
              Esta aplicación ofrece ejercicios para reflexionar y aprender. No reemplaza la atención médica, psicológica ni los servicios de emergencia. Si necesitas más ayuda, busca compañía y atención profesional en tu localidad.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
