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
      <p className="integration-context">
        Ya hiciste este descubrimiento. Puedes probar esta idea cuando sigas con tu día, sin usar el teléfono.
      </p>
      <p>{invitation.text}</p>
      <p className="helper-text">Si te ayuda, repítete en silencio:</p>
      <blockquote>{invitation.reminder}</blockquote>
      {nextUnlockAt ? (
        <p className="unlock-moment">
          <CalendarClock size={18} aria-hidden="true" />
          Tu próximo descubrimiento estará disponible el {formatLocalMoment(nextUnlockAt)}.
        </p>
      ) : null}
      <div className="integration-note">
        <strong>Puedes probarla si te viene bien.</strong>
        <span>Es opcional y no tienes que escribir ni confirmar que la hiciste. El próximo descubrimiento se abrirá a la hora indicada, aunque elijas no hacer esta propuesta.</span>
      </div>
    </article>
  );
}
