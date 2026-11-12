import Image from "next/image";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { ASSETS } from "@/lib/constants";

export function AuthPage({
  mode,
  initialError,
  restrictedAccess = false,
}: {
  mode: "login" | "register";
  initialError?: string;
  restrictedAccess?: boolean;
}) {
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link href="/" aria-label="Volver a Enfoca Tu Ser">
          <Image src={ASSETS.logo} width={420} height={130} alt="Enfoca Tu Ser" priority />
        </Link>
        <div className="auth-story-copy">
          <span className="eyebrow eyebrow-light">Tus ejercicios y tus notas</span>
          <h1>Un momento para reconocer cómo te sientes</h1>
          <p>{restrictedAccess
            ? "Este piloto está reservado para el equipo autorizado. Tu cuenta permite guardar y recuperar el recorrido de forma sincronizada."
            : "Clarissa Acevedo y Scarlett Vargas te acompañan con ejercicios para reconocer lo que sientes, respirar y decidir qué necesitas. Sigue las indicaciones a tu ritmo."}</p>
        </div>
      </section>
      <section className="auth-form-wrap">
        <AuthForm mode={mode} initialError={initialError} restrictedAccess={restrictedAccess} />
      </section>
    </main>
  );
}
