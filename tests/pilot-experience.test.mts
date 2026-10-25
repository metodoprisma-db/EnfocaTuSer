import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { ASSESSMENT_INDICATORS, compareAssessments, isValidAssessment } from "../src/lib/assessment.ts";
import { journalDraftKey, lessonDraftKey, parseJournalDraft } from "../src/lib/draft-storage.ts";
import { discoveries } from "../src/data/catalog.ts";

function assessment(stage: "initial" | "final", values: [number, number, number, number]) {
  return {
    id: stage,
    stage,
    calmScore: values[0],
    selfKindnessScore: values[1],
    clarityScore: values[2],
    peaceScore: values[3],
    reflectionNote: "",
    createdAt: "2026-10-22T12:00:00.000Z",
  };
}

test("el catálogo conserva las quince invitaciones aprobadas", () => {
  assert.equal(discoveries.length, 15);
  assert.equal(discoveries.every((item) => item.integrationInvitation), true);
  assert.deepEqual(discoveries[0].integrationInvitation, {
    title: "Un momento sin lucha",
    text: "Cuando una emoción aparezca mientras sigues con tu día, haz una pausa por un instante y dile por dentro: «Esto también puede estar aquí por un momento».",
    reminder: "Esto puede estar aquí por un momento.",
  });
  assert.equal(
    discoveries[14].integrationInvitation?.reminder,
    "El miedo puede venir conmigo; el paso lo elijo yo.",
  );
});

test("cada descubrimiento ofrece una guía editorial completa", () => {
  for (const item of discoveries) {
    assert.ok(item.description.length > 90, `${item.id}: apertura`);
    assert.ok((item.focus?.length ?? 0) > 70, `${item.id}: foco`);
    assert.ok((item.whyItMatters?.length ?? 0) > 70, `${item.id}: sentido`);
    assert.ok((item.presence?.length ?? 0) > 70, `${item.id}: presencia`);
    assert.ok(item.insight.length > 120, `${item.id}: desarrollo`);
    assert.ok((item.perspectives?.length ?? 0) >= 2, `${item.id}: perspectivas`);
    assert.ok(item.prompts.length >= 3, `${item.id}: preguntas`);
    assert.ok(item.action.length > 90, `${item.id}: experiencia`);
    assert.ok((item.closing?.length ?? 0) > 45, `${item.id}: cierre`);
  }
});

test("el acceso invitado permanece visible aunque la nube esté configurada", () => {
  const authForm = readFileSync(
    new URL("../src/components/auth/auth-form.tsx", import.meta.url),
    "utf8",
  );
  assert.match(authForm, /Continuar como invitada/);
  assert.doesNotMatch(authForm, /!hasSupabaseEnvironment \? \(/);
});

test("la comparación usa exactamente los mismos cuatro indicadores", () => {
  const result = compareAssessments(
    assessment("initial", [4, 5, 6, 7]),
    assessment("final", [6, 5, 4, 8]),
  );
  assert.equal(result.status, "complete");
  assert.deepEqual(result.rows.map((row) => row.difference), [2, 0, -2, 1]);
  assert.deepEqual(result.rows.map((row) => row.label), [
    "Calma frente a la prisa",
    "Amabilidad conmigo misma",
    "Claridad sobre lo que siento",
    "Paz y presencia",
  ]);
});

test("cada indicador conserva extremos propios y compasivos", () => {
  assert.deepEqual(
    ASSESSMENT_INDICATORS.map(({ startLabel, endLabel }) => [startLabel, endLabel]),
    [
      ["La prisa ocupa casi todo", "La calma tiene espacio"],
      ["Me trato con mucha exigencia", "Me trato con mucha amabilidad"],
      ["Me cuesta reconocer lo que siento", "Reconozco con claridad lo que siento"],
      ["Me siento lejos de la paz y el presente", "Siento paz y presencia"],
    ],
  );
});

test("si falta una evaluación no inventa filas comparativas", () => {
  const result = compareAssessments(assessment("initial", [5, 5, 5, 5]), null);
  assert.equal(result.status, "incomplete");
  assert.deepEqual(result.missing, ["final"]);
  assert.deepEqual(result.rows, []);
});

test("solo considera completa una fotografía con sus cuatro valores válidos", () => {
  assert.equal(isValidAssessment(assessment("initial", [5, 5, 5, 5]), "initial"), true);
  assert.equal(isValidAssessment({ ...assessment("initial", [5, 5, 5, 5]), calmScore: 0 }, "initial"), false);
  assert.equal(isValidAssessment({ ...assessment("initial", [5, 5, 5, 5]), peaceScore: 11 }, "initial"), false);
  assert.equal(isValidAssessment(assessment("final", [5, 5, 5, 5]), "initial"), false);
});

test("los borradores quedan aislados al cambiar de cuenta", () => {
  assert.notEqual(journalDraftKey("account-a"), journalDraftKey("account-b"));
  assert.notEqual(
    lessonDraftKey("account-a", "discovery", 0),
    lessonDraftKey("account-b", "discovery", 0),
  );
  assert.deepEqual(parseJournalDraft('{"title":"Hoy","content":"Una nota"}'), {
    title: "Hoy",
    content: "Una nota",
  });
  assert.deepEqual(parseJournalDraft("dato inválido"), { title: "", content: "" });
});
