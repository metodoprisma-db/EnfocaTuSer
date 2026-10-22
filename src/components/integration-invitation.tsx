import { CalendarClock, Leaf } from "lucide-react";

import type { CatalogItem } from "@/types/app";

export function formatLocalMoment(value: string) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export function IntegrationInvitation({
  item,
  nextUnlockAt,
  compact = false,
}: {
  item: CatalogItem;
  nextUnlockAt?: string | null;
  compact?: boolean;
}) {
  const invitation = item.integrationInvitation;
  if (!invitation) return null;

  return (
    <article className={`integration-card${compact ? " integration-card-compact" : ""}`}>
      <div className="integration-heading">
        <span className="integration-icon"><Leaf size={20} aria-hidden="true" /></span>
        <div>
          <span className="eyebrow">Llévalo contigo</span>
          <h2>{invitation.title}</h2>
        </div>
      </div>
      <p>{invitation.text}</p>
      <blockquote>{invitation.reminder}</blockquote>
      {nextUnlockAt ? (
        <p className="unlock-moment">
          <CalendarClock size={18} aria-hidden="true" />
          Tu próximo descubrimiento estará disponible el {formatLocalMoment(nextUnlockAt)}.
        </p>
      ) : null}
      <small>Es una invitación opcional para recordar sin el celular. No necesitas registrarla.</small>
    </article>
  );
}
