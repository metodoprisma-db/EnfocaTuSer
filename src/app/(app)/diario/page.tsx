import type { Metadata } from "next";

import { JournalView } from "@/components/journal-view";

export const metadata: Metadata = { title: "Mi diario" };

export default function DiarioPage() {
  return (
    <div className="page-wrap">
      <header className="page-header">
        <span className="eyebrow">Palabras que te devuelven a ti</span>
        <h1>Mi diario</h1>
        <p>Un lugar privado para guardar comprensiones, emociones y pequeños movimientos interiores.</p>
      </header>
      <JournalView />
    </div>
  );
}
