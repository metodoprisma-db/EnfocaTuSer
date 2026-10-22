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

  return (
    <div className="page-wrap journey-page">
      <header className="page-header journey-header">
        <span className="eyebrow">De hacer y tener, hacia ser</span>
        <h1>Mi camino</h1>
        <p>Un recorrido de quince descubrimientos, con espacio real entre uno y otro. Puedes volver a cada paso completado cuando lo necesites.</p>
      </header>

      <section className="path-map" aria-labelledby="path-map-title">
        <div className="section-heading">
          <div><span className="eyebrow">Tu recorrido</span><h2 id="path-map-title">Una capa a la vez</h2></div>
          <p>{meta.stats.discoveriesCompleted} de 15 descubrimientos recorridos</p>
        </div>
        <ol className="path-steps">
          {discoveries.map((item) => {
            const status = meta.progression.discoveryStatus(item.index);
            const open = status === "completed" || status === "available";
            const content = <><span>{String(item.number).padStart(2, "0")}</span><small>{status === "completed" ? "Recorrido" : status === "available" ? "Disponible" : status === "integrating" ? "Integrando" : "Más adelante"}</small></>;
            return (
              <li key={item.id} className={`path-step ${status}`}>
                {open ? <Link href={`/camino/discovery/${item.slug}`} aria-label={`${item.title}: ${status}`}>{content}</Link> : <div aria-label={`${item.title}: ${status}`}>{content}</div>}
              </li>
            );
          })}
        </ol>
      </section>

      {!meta.initialAssessment ? (
        <section className="journey-callout">
          <LockKeyhole size={22} />
          <div><span className="eyebrow">Antes de comenzar</span><h2>Tu punto de partida te espera en Mi espacio</h2><p>Elegir esa primera mirada abre el Descubrimiento 01 sin guardar valores por ti.</p></div>
          <Link className="button button-primary" href="/">Ir a Mi espacio <ArrowRight size={18} /></Link>
        </section>
      ) : current ? (
        <section className={`current-step-card ${currentStatus}`}>
          <div className="current-step-number">{String(current.number).padStart(2, "0")}</div>
          <div>
            <span className="eyebrow">{currentStatus === "integrating" ? "Tiempo de integración" : "Tu paso disponible"}</span>
            <h2>{current.title}</h2>
            <p>{current.description}</p>
            {currentStatus === "integrating" && meta.progression.nextUnlockAt ? (
              <p className="unlock-moment"><Clock3 size={18} /> Se abrirá el {formatLocalMoment(meta.progression.nextUnlockAt)}.</p>
            ) : (
              <Link className="button button-primary" href={`/camino/discovery/${current.slug}`}>Abrir este descubrimiento <ArrowRight size={18} /></Link>
            )}
          </div>
        </section>
      ) : (
        <section className="journey-callout complete"><Check size={23} /><div><span className="eyebrow">Recorrido completo</span><h2>Los quince descubrimientos ya forman parte de tu camino</h2><p>Puedes revisitarlos desde el mapa y entrar en las prácticas de profundidad.</p></div></section>
      )}

      {meta.pathComplete ? <JourneyComparison /> : null}

      <section className="section depth-section" aria-labelledby="depth-title">
        <div className="section-heading">
          <div><span className="eyebrow">Para quedarte un poco más</span><h2 id="depth-title">12 prácticas de profundidad</h2></div>
          <p>Se abren juntas al completar los quince descubrimientos.</p>
        </div>
        {meta.progression.practicesUnlocked ? (
          <div className="catalog-grid depth-grid">
            {depthPractices.map((item) => <CatalogCard key={item.id} item={item} completed={meta.completedExtras.has(item.index)} />)}
          </div>
        ) : (
          <div className="depth-locked"><LockKeyhole size={24} /><div><h3>Este espacio todavía está resguardado</h3><p>No necesitas hacer más ahora. Las doce prácticas aparecerán juntas cuando completes el Descubrimiento 15.</p></div></div>
        )}
      </section>
    </div>
  );
}
