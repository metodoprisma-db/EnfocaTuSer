import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { ASSESSMENT_INDICATORS, compareAssessments, isValidAssessment } from "../src/lib/assessment.ts";
import { journalDraftKey, lessonDraftKey, parseJournalDraft } from "../src/lib/draft-storage.ts";
import { allCatalogItems, discoveries } from "../src/data/catalog.ts";

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
    title: "Un momento para ti",
    text: "Cuando notes una emoción durante el día, detente unos segundos. Reconoce qué estás sintiendo. Si te ayuda, repite la frase de abajo en silencio.",
    reminder: "Puedo tomarme unos segundos para reconocer lo que siento.",
  });
  assert.equal(
    discoveries[14].integrationInvitation?.reminder,
    "Puedo elegir qué necesito antes de decidir.",
  );
});

test("cada ejercicio conserva la guía necesaria aunque su explicación sea breve", () => {
  assert.equal(allCatalogItems.length, 27);
  for (const item of allCatalogItems) {
    for (const field of ["description", "presence", "insight", "action", "durationLabel", "seed", "mentorNote"] as const) {
      assert.ok(item[field]?.trim(), `${item.id}: ${field}`);
    }
    assert.ok(item.prompts.length >= 2 && item.prompts.every((prompt) => prompt.trim()), `${item.id}: preguntas`);
    assert.ok(item.actionSteps.length >= 3 && item.actionSteps.every((step) => step.trim()), `${item.id}: instrucciones`);
    if (item.kind === "discovery") {
      assert.ok(item.focus?.trim(), `${item.id}: qué observar`);
      assert.ok(item.whyItMatters?.trim(), `${item.id}: para qué sirve`);
      assert.ok(item.closing?.trim(), `${item.id}: cierre`);
    }
  }
});

test("el acceso invitado permanece visible aunque la nube esté configurada", () => {
  const authForm = readFileSync(
    new URL("../src/components/auth/auth-form.tsx", import.meta.url),
    "utf8",
  );
  assert.match(authForm, /Continuar como invitada/);
  assert.match(authForm, /!restrictedAccess \? \(/);
  assert.doesNotMatch(authForm, /signInWithOAuth/);
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
      ["Siento mucha prisa", "Me siento en calma"],
      ["Me cuesta tratarme con amabilidad", "Me trato con mucha amabilidad"],
      ["Me cuesta reconocer lo que siento", "Reconozco con claridad lo que siento"],
      ["Me cuesta estar tranquila y atenta a este momento", "Me siento tranquila y atenta a este momento"],
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
