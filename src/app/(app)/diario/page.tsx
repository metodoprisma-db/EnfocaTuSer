import type { Metadata } from "next";

import { JournalView } from "@/components/journal-view";

export const metadata: Metadata = { title: "Mi diario" };

export default function DiarioPage() {
  return (
    <div className="page-wrap">
      <header className="page-header">
        <span className="eyebrow">Palabras que te devuelven a ti</span>
        <h1>Mi diario</h1>
        <p>Un lugar privado y opcional para guardar lo que quieras recordar. No necesitas escribir para avanzar en el camino.</p>
      </header>
      <JournalView />
    </div>
  );
}
