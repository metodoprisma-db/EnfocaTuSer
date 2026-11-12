import type { Metadata } from "next";

import { ReleasePractice } from "@/components/release-practice";

export const metadata: Metadata = { title: "Soltar ahora" };

export default function SoltarPage() {
  return (
    <div className="page-wrap">
      <header className="page-header">
        <span className="eyebrow">Una pausa para respirar y reconocer cómo estás</span>
        <h1>Soltar ahora</h1>
        <p>
          Sigue una pantalla a la vez. «Continuar» te lleva al paso siguiente y «Volver» al anterior. Puedes hacer la pausa sin escribir y parar cuando quieras.
        </p>
      </header>
      <ReleasePractice />
    </div>
  );
}
