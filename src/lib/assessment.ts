import type { UserAssessment } from "../types/app";

export const ASSESSMENT_INDICATORS = [
  { key: "calmScore", label: "Calma frente a la prisa" },
  { key: "selfKindnessScore", label: "Amabilidad conmigo misma" },
  { key: "clarityScore", label: "Claridad sobre lo que siento" },
  { key: "peaceScore", label: "Paz y presencia" },
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
