import Image from "next/image";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { ASSETS } from "@/lib/constants";

export function AuthPage({ mode, initialError }: { mode: "login" | "register"; initialError?: string }) {
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link href="/" aria-label="Volver a Enfoca Tu Ser">
          <Image src={ASSETS.logo} width={420} height={130} alt="Enfoca Tu Ser" priority />
        </Link>
        <div className="auth-story-copy">
          <span className="eyebrow eyebrow-light">Tu recorrido puede acompañarte</span>
          <h1>Vuelve a ti, estés donde estés.</h1>
          <p>Este espacio está sostenido para que tus notas y descubrimientos tengan un lugar cuidado, tanto si pruebas el recorrido como invitada como si decides sincronizarlo.</p>
        </div>
      </section>
      <section className="auth-form-wrap">
        <AuthForm mode={mode} initialError={initialError} />
      </section>
    </main>
  );
}
