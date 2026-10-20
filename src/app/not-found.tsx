import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="loading-screen">
      <div>
        <span className="eyebrow">Este paso no está disponible</span>
        <h1 style={{ color: "var(--etq-azul)" }}>Volvamos al camino</h1>
        <p>No encontramos el contenido que buscabas.</p>
        <Link className="button button-primary" href="/camino"><ArrowLeft size={18} /> Ir a mi camino</Link>
      </div>
    </main>
  );
}
