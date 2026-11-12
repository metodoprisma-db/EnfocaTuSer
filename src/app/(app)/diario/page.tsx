import type { Metadata } from "next";

import { JournalView } from "@/components/journal-view";

export const metadata: Metadata = { title: "Mi diario" };

export default function DiarioPage() {
  return (
    <div className="page-wrap">
      <header className="page-header">
        <span className="eyebrow">Tus notas, en un solo lugar</span>
        <h1>Mi diario</h1>
        <p>Puedes escribir lo que quieras recordar y leerlo después. Tus notas son privadas. También puedes hacer los ejercicios sin escribir aquí.</p>
      </header>
      <JournalView />
    </div>
  );
}
