import type { Metadata } from "next";

import { ReleasePractice } from "@/components/release-practice";

export const metadata: Metadata = { title: "Soltar ahora" };

export default function SoltarPage() {
  return (
    <div className="page-wrap">
      <header className="page-header">
        <span className="eyebrow">Una pausa de presencia</span>
        <h1>Soltar ahora</h1>
        <p>
          Cinco pasos breves para reconocer una emoción, escuchar el cuerpo y aflojar una parte del peso.
          Clarissa y Scarlett te acompañan desde este lado de la pantalla.
        </p>
      </header>
      <ReleasePractice />
    </div>
  );
}
