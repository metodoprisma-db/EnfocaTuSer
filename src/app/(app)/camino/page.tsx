"use client";

import Link from "next/link";
import { ArrowRight, Check, Clock3, LockKeyhole } from "lucide-react";

import { CatalogCard } from "@/components/catalog-card";
import { formatLocalMoment } from "@/components/integration-invitation";
import { JourneyComparison } from "@/components/journey-assessment";
import { useAppState } from "@/context/app-state";
import { depthPractices, discoveries } from "@/data/catalog";

export default function CaminoPage() {
  const { meta } = useAppState();
  const currentIndex = meta.progression.nextDiscoveryIndex;
  const current = currentIndex === null ? null : discoveries[currentIndex];
  const currentStatus = currentIndex === null ? null : meta.progression.discoveryStatus(currentIndex);
  const integrationTime = meta.unlockIntervalMs === 60_000 ? "un minuto" : "doce horas";

  return (
    <div className="page-wrap journey-page">
      <header className="page-header journey-header">
        <span className="eyebrow">Tus ejercicios, en orden</span>
        <h1>Mi camino</h1>
        <p>Cada descubrimiento tiene una explicación y un ejercicio. Al completar uno, el siguiente se abre después de {integrationTime}. Durante la espera puedes cerrar la aplicación. Los que completes quedan disponibles para volver a leerlos.</p>
      </header>

      <section className="path-map" aria-labelledby="path-map-title">
        <div className="section-heading">
          <div><span className="eyebrow">Tu recorrido</span><h2 id="path-map-title">Un descubrimiento a la vez</h2></div>
          <p>{meta.stats.discoveriesCompleted} de 15 descubrimientos completados</p>
        </div>
        <ol className="path-steps">
          {discoveries.map((item) => {
            const status = meta.progression.discoveryStatus(item.index);
            const open = status === "completed" || status === "available";
            const statusLabel = status === "completed" ? "Completado" : status === "available" ? "Disponible" : status === "integrating" ? "En espera" : status === "locked_assessment" ? "Primero tus respuestas" : "Más adelante";
            const content = <><span>{String(item.number).padStart(2, "0")}</span><small>{statusLabel}</small></>;
            return (
              <li key={item.id} className={`path-step ${status}`}>
                {open ? <Link href={`/camino/discovery/${item.slug}`} aria-label={`${item.title}: ${statusLabel}`}>{content}</Link> : <div aria-label={`${item.title}: ${statusLabel}`}>{content}</div>}
              </li>
            );
          })}
        </ol>
      </section>

      {!meta.initialAssessment ? (
        <section className="journey-callout">
          <LockKeyhole size={22} />
          <div><span className="eyebrow">Antes de comenzar</span><h2>Reconoce tu punto de partida</h2><p>En Mi espacio encontrarás cuatro preguntas sobre cómo te sientes. Se responden con números, sin usar la cámara. Al completarlas se abrirá «Empieza sin prisa».</p></div>
          <Link className="button button-primary" href="/">Ir a Mi espacio <ArrowRight size={18} /></Link>
        </section>
      ) : current ? (
        <section className={`current-step-card ${currentStatus}`}>
          <div className="current-step-number">{String(current.number).padStart(2, "0")}</div>
          <div>
            <span className="eyebrow">{currentStatus === "integrating" ? "Mientras esperas el próximo descubrimiento" : "Ya puedes abrirlo"}</span>
            <h2>{current.title}</h2>
            <p>{current.description}</p>
            {currentStatus === "integrating" && meta.progression.nextUnlockAt ? (
              <p className="unlock-moment"><Clock3 size={18} /> Tu próximo descubrimiento estará disponible el {formatLocalMoment(meta.progression.nextUnlockAt)}. No necesitas esperar aquí.</p>
            ) : (
              <Link className="button button-primary" href={`/camino/discovery/${current.slug}`}>Abrir este descubrimiento <ArrowRight size={18} /></Link>
            )}
          </div>
        </section>
      ) : (
        <section className="journey-callout complete"><Check size={23} /><div><span className="eyebrow">Recorrido completo</span><h2>Completaste los quince descubrimientos</h2><p>Puedes volver a leerlos desde los números de arriba o elegir una de las prácticas de abajo.</p></div></section>
      )}

      {meta.pathComplete ? <JourneyComparison /> : null}

      <section className="section depth-section" aria-labelledby="depth-title">
        <div className="section-heading">
          <div><span className="eyebrow">Para seguir practicando</span><h2 id="depth-title">12 prácticas que puedes volver a usar</h2></div>
          <p>Se abren juntas al completar los quince descubrimientos.</p>
        </div>
        {meta.progression.practicesUnlocked ? (
          <div className="catalog-grid depth-grid">
            {depthPractices.map((item) => <CatalogCard key={item.id} item={item} completed={meta.completedExtras.has(item.index)} />)}
          </div>
        ) : (
          <div className="depth-locked"><LockKeyhole size={24} /><div><h3>Estas prácticas se abren después del Descubrimiento 15</h3><p>Cuando se abran, podrás elegir la que quieras hacer y repetirla cuando te venga bien.</p></div></div>
        )}
      </section>
    </div>
  );
}
