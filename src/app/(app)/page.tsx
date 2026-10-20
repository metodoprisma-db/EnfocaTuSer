"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookHeart, CalendarHeart, Footprints, Sparkles } from "lucide-react";

import { AnnouncementBanner } from "@/components/announcement-banner";
import { GiftCard } from "@/components/gift-card";
import { useAppState } from "@/context/app-state";
import { discoveries } from "@/data/catalog";
import { ASSETS } from "@/lib/constants";

export default function HomePage() {
  const { state, actions, meta } = useAppState();
  const nextDiscovery = discoveries[Math.min(meta.nextDiscoveryIndex, 14)];

  return (
    <div className="page-wrap">
      <AnnouncementBanner />

      {state.rhythmResumed ? (
        <aside className="rhythm-return" aria-live="polite">
          <CalendarHeart size={21} />
          <div>
            <strong>Tomaste un respiro, hoy retomamos tu ritmo</strong>
            <span>Tus {state.data.profile.presenceDaysCount} días de presencia siguen contigo.</span>
          </div>
          <button type="button" onClick={actions.dismissRhythmMessage}>Entendido</button>
        </aside>
      ) : null}

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Tu espacio para volver a ti</span>
          <h1>Afloja el peso.<br />Escucha tu ser.</h1>
          <p>
            Clarissa Acevedo y Scarlett Vargas te acompañan a quitar capas de autoexigencia,
            reconocer lo que sientes y avanzar con más paz.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href={meta.pathComplete ? "/camino" : `/camino/discovery/${nextDiscovery.slug}`}>
              {meta.pathComplete ? "Ver lo que he caminado" : "Continuar mi camino"} <ArrowRight size={18} />
            </Link>
            <Link className="button button-secondary" href="/soltar">
              <Sparkles size={18} /> Necesito soltar algo
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <Image src={ASSETS.butterfly} fill sizes="(max-width: 820px) 80vw, 38vw" priority alt="Mariposa de Enfoca Tu Ser" />
        </div>
      </section>

      <section className="section" aria-labelledby="huellas-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Huellas de presencia</span>
            <h2 id="huellas-title">Tu recorrido, sin presión</h2>
          </div>
          <p>Cada número guarda un momento en que elegiste mirarte con honestidad y cuidado.</p>
        </div>
        <div className="stats-grid stats-grid-four">
          <div className="stat-card">
            <div className="stat-icon"><Footprints size={20} /></div>
            <strong>{meta.stats.discoveriesCompleted}</strong>
            <span>descubrimientos recorridos</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><CalendarHeart size={20} /></div>
            <strong>{state.data.profile.presenceDaysCount}</strong>
            <span>días de presencia acumulados</span>
            <small>Ritmo actual: {state.data.profile.currentRhythmCount}</small>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Sparkles size={20} /></div>
            <strong>{meta.stats.pausesCompleted}</strong>
            <span>pausas para soltar</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><BookHeart size={20} /></div>
            <strong>{meta.stats.journalEntries}</strong>
            <span>huellas en tu diario</span>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Regalo de acompañamiento">
        <GiftCard />
      </section>

      <section className="section" aria-labelledby="next-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Una capa a la vez</span>
            <h2 id="next-title">{meta.pathComplete ? "Tu recorrido completo" : "Tu próximo descubrimiento"}</h2>
          </div>
        </div>
        <article className="surface-card" style={{ padding: "clamp(25px, 4vw, 42px)" }}>
          <span className="info-badge">{meta.pathComplete ? "Camino completo" : `Descubrimiento ${String(nextDiscovery.number).padStart(2, "0")}`}</span>
          <h3 style={{ color: "var(--etq-azul)", marginTop: 16 }}>{meta.pathComplete ? "Lo que has caminado" : nextDiscovery.title}</h3>
          <p style={{ maxWidth: 700, color: "var(--etq-chocolate-suave)" }}>{meta.pathComplete ? "Tus fotografías, pausas y reflexiones ya cuentan una historia que merece ser mirada con ternura." : nextDiscovery.description}</p>
          <Link className="button button-primary" href={meta.pathComplete ? "/camino" : `/camino/discovery/${nextDiscovery.slug}`}>
            {meta.pathComplete ? "Abrir mi comparativa" : "Abrir este descubrimiento"} <ArrowRight size={18} />
          </Link>
        </article>
      </section>
    </div>
  );
}
