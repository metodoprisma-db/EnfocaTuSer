import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFINITIVE_UNLOCK_INTERVAL_MS,
  PILOT_UNLOCK_INTERVAL_MS,
  evaluateProgression,
  unlockIntervalForEnvironment,
} from "../src/lib/progression.ts";

const start = Date.parse("2026-10-22T12:00:00.000Z");

function discovery(itemIndex: number, completedAt = start) {
  return {
    kind: "discovery" as const,
    itemIndex,
    completedAt: new Date(completedAt).toISOString(),
  };
}

test("usa un minuto en desarrollo y previews, y doce horas en producción", () => {
  assert.equal(
    unlockIntervalForEnvironment("development", undefined),
    PILOT_UNLOCK_INTERVAL_MS,
  );
  assert.equal(
    unlockIntervalForEnvironment("production", "preview"),
    PILOT_UNLOCK_INTERVAL_MS,
  );
  assert.equal(
    unlockIntervalForEnvironment("production", "production"),
    DEFINITIVE_UNLOCK_INTERVAL_MS,
  );
});

test("abre el primer descubrimiento inmediatamente", () => {
  const state = evaluateProgression([], start, PILOT_UNLOCK_INTERVAL_MS);
  assert.equal(state.discoveryStatus(0), "available");
  assert.equal(state.discoveryStatus(1), "locked_sequence");
  assert.equal(state.canComplete("discovery", 0), true);
});

test("bloquea todo el recorrido hasta completar la fotografía inicial", () => {
  const state = evaluateProgression(
    [],
    start,
    PILOT_UNLOCK_INTERVAL_MS,
    false,
  );
  assert.equal(state.discoveryStatus(0), "locked_assessment");
  assert.equal(state.canComplete("discovery", 0), false);
});

test("un progreso heredado no oculta el requisito de la fotografía inicial", () => {
  const state = evaluateProgression(
    [discovery(0)],
    start + PILOT_UNLOCK_INTERVAL_MS,
    PILOT_UNLOCK_INTERVAL_MS,
    false,
  );
  assert.equal(state.discoveriesCompleted, 1);
  assert.equal(state.discoveryStatus(0), "locked_assessment");
  assert.equal(state.discoveryStatus(1), "locked_assessment");
});

test("mantiene el siguiente paso integrando hasta el minuto exacto", () => {
  const before = evaluateProgression(
    [discovery(0)],
    start + PILOT_UNLOCK_INTERVAL_MS - 1,
    PILOT_UNLOCK_INTERVAL_MS,
  );
  assert.equal(before.discoveryStatus(0), "completed");
  assert.equal(before.discoveryStatus(1), "integrating");
  assert.equal(before.activeInvitationIndex, 0);
  assert.equal(before.canComplete("discovery", 1), false);

  const boundary = evaluateProgression(
    [discovery(0)],
    start + PILOT_UNLOCK_INTERVAL_MS,
    PILOT_UNLOCK_INTERVAL_MS,
  );
  assert.equal(boundary.discoveryStatus(1), "available");
  assert.equal(boundary.activeInvitationIndex, null);
  assert.equal(boundary.canComplete("discovery", 1), true);
});

test("la misma regla conserva doce horas reales al recargar", () => {
  const persisted = [discovery(0)];
  const reloaded = evaluateProgression(
    persisted,
    start + DEFINITIVE_UNLOCK_INTERVAL_MS - 1,
    DEFINITIVE_UNLOCK_INTERVAL_MS,
  );
  assert.equal(reloaded.discoveryStatus(1), "integrating");
  const ready = evaluateProgression(
    persisted,
    start + DEFINITIVE_UNLOCK_INTERVAL_MS,
    DEFINITIVE_UNLOCK_INTERVAL_MS,
  );
  assert.equal(ready.discoveryStatus(1), "available");
});

test("una URL posterior no altera la secuencia", () => {
  const state = evaluateProgression(
    [discovery(0)],
    start + PILOT_UNLOCK_INTERVAL_MS,
    PILOT_UNLOCK_INTERVAL_MS,
  );
  assert.equal(state.discoveryStatus(2), "locked_sequence");
  assert.equal(state.canComplete("discovery", 2), false);
});

test("el regalo aparece con cinco pasos sin adelantar el sexto", () => {
  const progress = Array.from({ length: 5 }, (_, index) =>
    discovery(index, start + index * PILOT_UNLOCK_INTERVAL_MS),
  );
  const state = evaluateProgression(
    progress,
    start + 4 * PILOT_UNLOCK_INTERVAL_MS,
    PILOT_UNLOCK_INTERVAL_MS,
  );
  assert.equal(state.giftUnlocked, true);
  assert.equal(state.discoveryStatus(5), "integrating");
});

test("las prácticas se abren juntas al completar el paso quince", () => {
  const progress = Array.from({ length: 15 }, (_, index) => discovery(index));
  const state = evaluateProgression(progress, start, DEFINITIVE_UNLOCK_INTERVAL_MS);
  assert.equal(state.pathComplete, true);
  assert.equal(state.practicesUnlocked, true);
  assert.equal(state.extraStatus(0), "available");
  assert.equal(state.extraStatus(11), "available");
});

test("ignora fechas inválidas y avances fuera de orden", () => {
  const state = evaluateProgression(
    [discovery(0), discovery(2), { ...discovery(1), completedAt: "invalid" }],
    start + DEFINITIVE_UNLOCK_INTERVAL_MS,
    DEFINITIVE_UNLOCK_INTERVAL_MS,
  );
  assert.equal(state.discoveriesCompleted, 1);
  assert.equal(state.discoveryStatus(2), "locked_sequence");
});
