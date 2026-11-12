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
          Una pausa guiada para reconocer cómo estás, observar el cuerpo y respirar con suavidad. Sigue una pantalla a la vez usando «Continuar» y «Volver». Escribir es opcional. Puedes detenerte cuando lo necesites y cerrar aunque te sientas igual que al comenzar.
        </p>
      </header>
      <ReleasePractice />
    </div>
  );
}
