import type { Metadata } from "next";

import { CompassView } from "@/components/compass-view";

export const metadata: Metadata = { title: "Brújula interior" };

export default function BrujulaPage() {
  return (
    <div className="page-wrap">
      <header className="page-header">
        <span className="eyebrow">Orientarte desde lo que sientes</span>
        <h1>Brújula interior</h1>
        <p>
          Elige una etapa y después toca la palabra que se acerque a cómo te sientes. Debajo aparecerá una orientación de Clarissa y Scarlett. Puedes cambiar tu elección cuando quieras: una emoción describe un momento de tu experiencia.
        </p>
      </header>
      <CompassView />
    </div>
  );
}
