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
  crisalida: "Aprender",
  mariposa: "Disfrutar",
} as const;

const stageTitles = {
  oruga: "Reconocer cómo te sientes",
  crisalida: "Pensar qué puedes hacer",
  mariposa: "Disfrutar lo que te hace bien",
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
          <span className="eyebrow">Cómo usar la Brújula</span>
          <h2 id="compass-guide-title">Elige una palabra para leer una idea</h2>
        </div>
        <p>
          Las imágenes agrupan distintas palabras. Pulsa una y después elige una palabra para leer una idea. Tú decides si esa palabra se parece a lo que sientes. Los números pertenecen a este mapa simbólico y no son una calificación.
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
                <Image
                  src={stageImages[zone.id as keyof typeof stageImages]}
                  width={400}
                  height={400}
                  sizes="(max-width: 820px) calc(100vw - 88px), 30vw"
                  alt=""
                />
              </span>
              <span className="metamorphosis-stage">{stageVerbs[zone.id as keyof typeof stageVerbs]} · Etapa {zone.stage}</span>
              <strong>{stageTitles[zone.id as keyof typeof stageTitles]}</strong>
              <span className="metamorphosis-count">{zone.frequencies.length} palabras para elegir</span>
            </button>
          );
        })}
      </div>

      <section className={`frequency-panel stage-${selectedZone.id}`}>
        <div className="frequency-panel-heading">
          <div>
            <span className="eyebrow">Etapa {selectedZone.stage}</span>
            <h2>{stageTitles[selectedZone.id as keyof typeof stageTitles]}</h2>
            <p>{selectedZone.detail}</p>
          </div>
          <Image
            className="frequency-brand-mark"
            src={stageImages[selectedZone.id as keyof typeof stageImages]}
            width={400}
            height={400}
            sizes="(max-width: 570px) 180px, 160px"
            alt={`Representación de la etapa ${selectedZone.stage}`}
          />
        </div>

        <details className="compass-map-terms">
          <summary>Leer los nombres originales de esta escala</summary>
          <p>{selectedZone.leadership} · {selectedZone.calibration}.</p>
          <p>{selectedZone.title}. Estos nombres agrupan emociones dentro de la escala. No describen cómo eres como persona.</p>
        </details>

        <div className="frequency-list" aria-label={`Palabras de la etapa ${selectedZone.stage}`}>
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
          <span>Número del mapa</span>
          <strong>{selectedFrequency.value}</strong>
        </div>
        <div className="selected-frequency-copy">
          <span className="eyebrow">Clarissa y Scarlett te acompañan</span>
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
              Ver el descubrimiento relacionado <ArrowRight size={17} />
            </Link>
          </div>
          <p className="helper-text">Los descubrimientos se abren en el orden de Mi camino. Puedes usar Soltar ahora en cualquier momento del recorrido.</p>
        </div>
      </section>

      <p className="compass-disclaimer">
        La Brújula usa imágenes y números como una guía emocional y espiritual.
        No es una medición científica ni una medida de tu valor personal.
      </p>
    </div>
  );
}
