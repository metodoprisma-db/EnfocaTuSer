"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { useAppState } from "@/context/app-state";
import { compassZones } from "@/data/catalog";
import { ASSETS } from "@/lib/constants";

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
      <div className="metamorphosis-grid" aria-label="Etapas de la brújula interior">
        {compassZones.map((zone) => {
          const active = selectedZone.id === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              className={`metamorphosis-card stage-${zone.id}${active ? " selected" : ""}`}
              onClick={() => actions.setCompassEmotion(zone.frequencies[0].emotion)}
              aria-pressed={active}
            >
              <span className="metamorphosis-mark" aria-hidden="true">
                <Image src={ASSETS.mark} width={72} height={72} alt="" />
              </span>
              <span className="metamorphosis-stage">Etapa {zone.stage}</span>
              <strong>{zone.leadership}</strong>
              <span className="metamorphosis-calibration">{zone.calibration}</span>
              <span className="metamorphosis-detail">{zone.title}</span>
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
            src={ASSETS.mark}
            width={116}
            height={116}
            alt="Isotipo oficial de Enfoca Tu Ser"
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
