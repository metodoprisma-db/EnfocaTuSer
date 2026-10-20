"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { ASSETS, hasSupabaseEnvironment } from "@/lib/constants";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export function AdminLoginForm({ initialError = "" }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    initialError === "forbidden"
      ? "Esta cuenta no tiene acceso al panel de administración."
      : "",
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const client = getBrowserSupabaseClient();
    if (!client) {
      setMessage("Configura Supabase para habilitar el acceso administrativo.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setLoading(false);
      setMessage("Revisa el correo y la contraseña.");
      return;
    }

    const { data: authData, error: userError } = await client.auth.getUser();
    if (userError || !authData.user) {
      await client.auth.signOut();
      setLoading(false);
      setMessage("No pudimos verificar esta sesión.");
      return;
    }

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      await client.auth.signOut();
      setLoading(false);
      setMessage("Esta cuenta no tiene acceso al panel de administración.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Image src={ASSETS.logo} width={420} height={130} alt="Enfoca Tu Ser" priority />
        <span className="eyebrow"><LockKeyhole size={15} /> Acceso reservado</span>
        <h1>Administración</h1>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="admin-email">Correo</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="admin-password">Contraseña</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button className="button button-primary" type="submit" disabled={loading || !hasSupabaseEnvironment}>
            {loading ? "Verificando..." : "Entrar al panel"} <ArrowRight size={18} />
          </button>
        </form>
        {message ? <p className="form-message" role="alert">{message}</p> : null}
      </section>
    </main>
  );
}
