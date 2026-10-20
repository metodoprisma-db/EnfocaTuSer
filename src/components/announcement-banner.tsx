"use client";

import { ArrowUpRight, BellRing } from "lucide-react";

import { useAppState } from "@/context/app-state";

export function AnnouncementBanner() {
  const { state } = useAppState();
  const announcement = state.announcement;
  if (!announcement) return null;

  return (
    <aside className={`announcement-banner variant-${announcement.variant}`} aria-label="Novedades de Enfoca Tu Ser">
      <span className="announcement-icon"><BellRing size={20} /></span>
      <div>
        <span className="eyebrow">Novedades</span>
        <h2>{announcement.title}</h2>
        <p>{announcement.message}</p>
      </div>
      {announcement.ctaLabel && announcement.ctaUrl ? (
        <a
          className="button button-secondary"
          href={announcement.ctaUrl}
          target={announcement.ctaUrl.startsWith("http") ? "_blank" : undefined}
          rel={announcement.ctaUrl.startsWith("http") ? "noreferrer" : undefined}
        >
          {announcement.ctaLabel} <ArrowUpRight size={17} />
        </a>
      ) : null}
    </aside>
  );
}
