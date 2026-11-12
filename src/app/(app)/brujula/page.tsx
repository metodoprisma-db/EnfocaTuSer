import type { Metadata } from "next";

import { CompassView } from "@/components/compass-view";

export const metadata: Metadata = { title: "Brújula interior" };

export default function BrujulaPage() {
  return (
    <div className="page-wrap">
      <header className="page-header">
        <span className="eyebrow">Para reconocer cómo te sientes</span>
        <h1>Brújula interior</h1>
        <p>
          Primero elige una de las tres imágenes. Después elige una palabra. Debajo podrás leer una idea de Clarissa y Scarlett para ese momento. Puedes cambiar tu elección cuando quieras.
        </p>
      </header>
      <CompassView />
    </div>
  );
}
