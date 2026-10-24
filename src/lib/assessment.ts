import type { UserAssessment } from "../types/app";

export const ASSESSMENT_INDICATORS = [
  {
    key: "calmScore",
    label: "Calma frente a la prisa",
    startLabel: "La prisa ocupa casi todo",
    endLabel: "La calma tiene espacio",
  },
  {
    key: "selfKindnessScore",
    label: "Amabilidad conmigo misma",
    startLabel: "Me trato con mucha exigencia",
    endLabel: "Me trato con mucha amabilidad",
  },
  {
    key: "clarityScore",
    label: "Claridad sobre lo que siento",
    startLabel: "Me cuesta reconocer lo que siento",
    endLabel: "Reconozco con claridad lo que siento",
  },
  {
    key: "peaceScore",
    label: "Paz y presencia",
    startLabel: "Me siento lejos de la paz y el presente",
    endLabel: "Siento paz y presencia",
  },
] as const;

export type AssessmentScoreKey = (typeof ASSESSMENT_INDICATORS)[number]["key"];

export function compareAssessments(
  initial: UserAssessment | null,
  final: UserAssessment | null,
) {
  const missing = [
    ...(initial ? [] : ["initial" as const]),
    ...(final ? [] : ["final" as const]),
  ];
  if (!initial || !final) return { status: "incomplete" as const, missing, rows: [] };

  return {
    status: "complete" as const,
    missing,
    rows: ASSESSMENT_INDICATORS.map((indicator) => ({
      ...indicator,
      start: initial[indicator.key],
      current: final[indicator.key],
      difference: final[indicator.key] - initial[indicator.key],
    })),
  };
}
