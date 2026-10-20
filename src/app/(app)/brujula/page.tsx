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
          Recorre las etapas Oruga, Crisálida y Mariposa. Toca la frecuencia que se acerque a tu momento y recibe una orientación amable para acompañarla.
        </p>
      </header>
      <CompassView />
    </div>
  );
}
