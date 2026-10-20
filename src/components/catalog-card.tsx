"use client";

import Link from "next/link";
import { ArrowRight, Check, Gift, LockKeyhole } from "lucide-react";

import type { CatalogItem } from "@/types/app";

export function CatalogCard({
  item,
  completed,
  locked = false,
}: {
  item: CatalogItem;
  completed: boolean;
  locked?: boolean;
}) {
  const content = (
    <>
      <div className="catalog-number">
        <span>
          {item.kind === "discovery" ? "Descubrimiento" : "Práctica"}{" "}
          {String(item.number).padStart(2, "0")}
        </span>
        {item.hasGift ? (
          <span className="catalog-gift" aria-label="Incluye un regalo especial">
            <Gift size={21} />
          </span>
        ) : null}
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <div className="catalog-footer">
        {completed ? (
          <span className="completed-badge"><Check size={14} /> Recorrido</span>
        ) : locked ? (
          <span className="locked-badge"><LockKeyhole size={14} /> Aún cerrado</span>
        ) : (
          <span>Explorar</span>
        )}
        {locked ? <LockKeyhole size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
      </div>
    </>
  );

  if (locked) {
    return (
      <article className="catalog-card locked">
        {content}
      </article>
    );
  }

  return (
    <Link
      href={`/camino/${item.kind}/${item.slug}`}
      className={`catalog-card${completed ? " completed" : ""}`}
    >
      {content}
    </Link>
  );
}
