export type InternalAccessDecision =
  | "open"
  | "configuration_error"
  | "sign_in_required"
  | "not_allowed"
  | "allowed";

export function normalizeAccessEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function parseAllowedEmails(value: string | null | undefined) {
  const emails = (value ?? "")
    .split(/[\s,;]+/)
    .map(normalizeAccessEmail)
    .filter(Boolean);

  return new Set(emails);
}

export function evaluateInternalAccess({
  restricted,
  allowedEmails,
  userEmail,
}: {
  restricted: boolean;
  allowedEmails: ReadonlySet<string>;
  userEmail: string | null | undefined;
}): InternalAccessDecision {
  if (!restricted) return "open";
  if (allowedEmails.size === 0) return "configuration_error";

  const normalizedEmail = normalizeAccessEmail(userEmail);
  if (!normalizedEmail) return "sign_in_required";
  return allowedEmails.has(normalizedEmail) ? "allowed" : "not_allowed";
}

export function isRestrictedInternalPilot(value: string | null | undefined) {
  return value?.trim().toLowerCase() === "restricted";
}
