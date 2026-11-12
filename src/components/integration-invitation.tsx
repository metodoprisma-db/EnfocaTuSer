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
        Ya completaste este descubrimiento. Si te apetece, puedes probar esta idea durante una actividad cotidiana, sin usar el teléfono.
      </p>
      <p>{invitation.text}</p>
      <blockquote>{invitation.reminder}</blockquote>
      {nextUnlockAt ? (
        <p className="unlock-moment">
          <CalendarClock size={18} aria-hidden="true" />
          Tu próximo descubrimiento estará disponible el {formatLocalMoment(nextUnlockAt)}.
        </p>
      ) : null}
      <div className="integration-note">
        <strong>Una invitación para cuando te venga bien.</strong>
        <span>Es opcional. Puedes hacerla o dejarla pasar, sin escribir ni confirmar nada. El siguiente descubrimiento se abre al cumplirse el tiempo de integración, aunque elijas continuar con tu día.</span>
      </div>
    </article>
  );
}
