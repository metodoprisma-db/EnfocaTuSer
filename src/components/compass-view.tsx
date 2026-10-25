"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { useAppState } from "@/context/app-state";
import { compassZones } from "@/data/catalog";

const stageImages = {
  oruga: "/ETS-niveles-conciencia-oruga.png",
  crisalida: "/ETS-niveles-conciencia-crisalida.png",
  mariposa: "/ETS-niveles-conciencia-mariposa.png",
} as const;

const stageVerbs = {
  oruga: "Reconocer",
  crisalida: "Transformar",
  mariposa: "Expandir",
} as const;

export function CompassView() {
  const { state, actions } = useAppState();
  const selectedZone =
    compassZones.find((zone) =>
      zone.frequencies.some(
        (frequency) => frequency.emotion === state.data.lastCompassEmotion,
      ),
    ) ?? compassZones[0];
  const selectedFrequency =
    selectedZone.frequencies.find(
      (frequency) => frequency.emotion === state.data.lastCompassEmotion,
    ) ?? selectedZone.frequencies[0];

  return (
    <div className="frequency-compass">
      <section className="compass-guide" aria-labelledby="compass-guide-title">
        <div>
          <span className="eyebrow">Cómo leer este mapa</span>
          <h2 id="compass-guide-title">Tres etapas para orientarte, no para clasificarte</h2>
        </div>
        <p>
          Las frecuencias se agrupan en un recorrido visual: reconocer estados de reacción, atravesar el puente de la conciencia y abrir espacio a una presencia más amplia. No tienes que subir ni permanecer en una etapa. Elige la palabra que más se acerque a hoy.
        </p>
      </section>

      <div className="metamorphosis-grid" aria-label="Etapas de la brújula interior">
        {compassZones.map((zone, zoneIndex) => {
          const active = selectedZone.id === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              className={`metamorphosis-card stage-${zone.id}${active ? " selected" : ""}`}
              onClick={() => actions.setCompassEmotion(zone.frequencies[0].emotion)}
              aria-pressed={active}
            >
              <span className="metamorphosis-order" aria-hidden="true">0{zoneIndex + 1}</span>
              <span className="metamorphosis-mark" aria-hidden="true">
                <Image src={stageImages[zone.id as keyof typeof stageImages]} width={400} height={400} alt="" />
              </span>
              <span className="metamorphosis-stage">{stageVerbs[zone.id as keyof typeof stageVerbs]} · Etapa {zone.stage}</span>
              <strong>{zone.leadership}</strong>
              <span className="metamorphosis-calibration">{zone.calibration}</span>
              <span className="metamorphosis-detail">{zone.title}</span>
              <span className="metamorphosis-count">{zone.frequencies.length} frecuencias para explorar</span>
            </button>
          );
        })}
      </div>

      <section className={`frequency-panel stage-${selectedZone.id}`}>
        <div className="frequency-panel-heading">
          <div>
            <span className="eyebrow">Etapa {selectedZone.stage}</span>
            <h2>{selectedZone.leadership}</h2>
            <p>{selectedZone.detail}</p>
          </div>
          <Image
            className="frequency-brand-mark"
            src={stageImages[selectedZone.id as keyof typeof stageImages]}
            width={400}
            height={400}
            alt={`Representación de la etapa ${selectedZone.stage}`}
          />
        </div>

        <div className="frequency-list" aria-label={`Frecuencias de la etapa ${selectedZone.stage}`}>
          {selectedZone.frequencies.map((frequency) => {
            const active = selectedFrequency.emotion === frequency.emotion;
            return (
              <button
                key={frequency.emotion}
                type="button"
                className={`frequency-button${active ? " selected" : ""}`}
                onClick={() => actions.setCompassEmotion(frequency.emotion)}
                aria-pressed={active}
              >
                <span>{frequency.emotion}</span>
                <strong>{frequency.value}</strong>
              </button>
            );
          })}
        </div>
      </section>

      <section className="surface-card compass-result" aria-live="polite">
        <div className="selected-frequency-value">
          <span>Frecuencia</span>
          <strong>{selectedFrequency.value}</strong>
        </div>
        <div className="selected-frequency-copy">
          <span className="eyebrow">Una guía para este momento</span>
          <h2>{selectedFrequency.emotion}</h2>
          <p>{selectedFrequency.guidance}</p>
          <div className="button-row">
            <Link className="button button-primary" href="/soltar">
              <Sparkles size={17} /> Soltar ahora
            </Link>
            <Link
              className="button button-secondary"
              href={`/camino/discovery/${selectedFrequency.discoverySlug}`}
            >
              Ir a la lección relacionada <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <p className="compass-disclaimer">
        Esta escala es una brújula simbólica de orientación emocional y espiritual.
        No es una medición científica ni una medida de tu valor personal.
      </p>
    </div>
  );
}
