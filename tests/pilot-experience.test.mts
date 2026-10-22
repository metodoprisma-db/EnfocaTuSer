import assert from "node:assert/strict";
import test from "node:test";

import { compareAssessments } from "../src/lib/assessment.ts";
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

test("si falta una evaluación no inventa filas comparativas", () => {
  const result = compareAssessments(assessment("initial", [5, 5, 5, 5]), null);
  assert.equal(result.status, "incomplete");
  assert.deepEqual(result.missing, ["final"]);
  assert.deepEqual(result.rows, []);
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
