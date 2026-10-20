"use client";

import { CatalogCard } from "@/components/catalog-card";
import { JourneyAssessment, JourneyComparison } from "@/components/journey-assessment";
import { useAppState } from "@/context/app-state";
import { depthPractices, discoveries } from "@/data/catalog";

export default function CaminoPage() {
  const { meta } = useAppState();

  return (
    <div className="page-wrap">
      <header className="page-header">
        <span className="eyebrow">De hacer y tener, hacia ser</span>
        <h1>Mi camino</h1>
        <p>
          Quince descubrimientos para aflojar capas de peso emocional y doce prácticas para seguir
          profundizando. Clarissa y Scarlett te acompañan con cercanía en cada paso.
        </p>
      </header>

      {!meta.initialAssessment && meta.nextDiscoveryIndex <= 2 ? (
        <section className="section section-first">
          <JourneyAssessment stage="initial" />
        </section>
      ) : null}

      {meta.pathComplete && !meta.finalAssessment ? (
        <section className="section section-first">
          <JourneyAssessment stage="final" />
        </section>
      ) : null}

      {meta.pathComplete && meta.finalAssessment ? (
        <section className="section section-first">
          <JourneyComparison />
        </section>
      ) : null}

      <section className="section section-first" aria-labelledby="discoveries-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Primera parte</span>
            <h2 id="discoveries-title">15 descubrimientos</h2>
          </div>
          <p>Comienza por el paso abierto. Al completarlo se habilitará el siguiente, siempre a tu ritmo.</p>
        </div>
        <div className="catalog-grid">
          {discoveries.map((item) => (
            <CatalogCard
              key={item.id}
              item={item}
              completed={meta.completedDiscoveries.has(item.index)}
              locked={!meta.isDiscoveryUnlocked(item.index)}
            />
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="depth-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Para quedarte un poco más</span>
            <h2 id="depth-title">12 prácticas de profundidad</h2>
          </div>
          <p>Perspectivas breves para cultivar presencia en tus metas, vínculos y momentos cotidianos.</p>
        </div>
        <div className="catalog-grid">
          {depthPractices.map((item) => (
            <CatalogCard key={item.id} item={item} completed={meta.completedExtras.has(item.index)} />
          ))}
        </div>
      </section>
    </div>
  );
}
