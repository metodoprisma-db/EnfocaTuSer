"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { ArrowRight, Globe2, LockKeyhole } from "lucide-react";

import { hasSupabaseEnvironment } from "@/lib/constants";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export function AuthForm({ mode, initialError = "" }: { mode: "login" | "register"; initialError?: string }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(initialError ? "No pudimos completar el acceso. Inténtalo otra vez." : "");
  const [success, setSuccess] = useState(false);
  const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  const canUseCloud = hasSupabaseEnvironment && Boolean(turnstileKey);

  const validate = () => {
    if (website) {
      setMessage("No pudimos validar el formulario.");
      return false;
    }
    if (!hasSupabaseEnvironment) {
      setMessage("El acceso en la nube estará disponible cuando se conecte Supabase. Puedes entrar en modo local ahora.");
      return false;
    }
    if (!turnstileKey || !captchaToken) {
      setMessage("Completa la verificación de seguridad para continuar.");
      return false;
    }
    return true;
  };

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    if (!validate()) return;
    const client = getBrowserSupabaseClient();
    if (!client) return;

    setLoading(true);
    if (mode === "login") {
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken },
      });
      setLoading(false);
      if (error) {
        setMessage("Revisa el correo, la contraseña y la verificación de seguridad.");
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const { error } = await client.auth.signUp({
      email,
      password,
      options: {
        captchaToken,
        data: { display_name: displayName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setMessage("No pudimos crear la cuenta. Revisa los datos e inténtalo otra vez.");
      return;
    }
    setSuccess(true);
    setMessage("Revisa tu correo para confirmar la cuenta y abrir tu espacio sincronizado.");
  };

  const signInWithGoogle = async () => {
    setMessage("");
    if (!validate()) return;
    const client = getBrowserSupabaseClient();
    if (!client) return;
    setLoading(true);
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setLoading(false);
      setMessage("No pudimos iniciar el acceso con Google.");
    }
  };

  return (
    <div className="auth-card">
      <span className="eyebrow">{mode === "login" ? "Volver a tu espacio" : "Guardar tu recorrido"}</span>
      <h2>{mode === "login" ? "Qué bueno verte" : "Crea tu acceso"}</h2>
      <p>
        {mode === "login"
          ? "Sincroniza tus notas y avances entre dispositivos."
          : "Tu progreso local se unirá a tu cuenta después del primer acceso."}
      </p>

      <button className="button button-secondary" style={{ width: "100%" }} type="button" onClick={signInWithGoogle} disabled={loading || !canUseCloud}>
        <Globe2 size={18} /> Continuar con Google
      </button>

      <div className="divider">o con correo</div>

      <form onSubmit={submitEmail}>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="website">Sitio web</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </div>

        {mode === "register" ? (
          <div className="field">
            <label htmlFor="display-name">¿Cómo deseas que te llamemos?</label>
            <input id="display-name" autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} required />
        </div>

        {turnstileKey ? (
          <div style={{ marginTop: 20, overflow: "hidden" }}>
            <Turnstile
              siteKey={turnstileKey}
              onSuccess={setCaptchaToken}
              onExpire={() => setCaptchaToken("")}
              onError={() => setCaptchaToken("")}
              options={{ theme: "light", language: "es" }}
            />
          </div>
        ) : (
          <p className="helper-text" style={{ marginTop: 18 }}>
            <LockKeyhole size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />
            El acceso protegido se activará al configurar Turnstile.
          </p>
        )}

        <button className="button button-primary" style={{ width: "100%", marginTop: 20 }} type="submit" disabled={loading || !canUseCloud}>
          {loading ? "Preparando..." : mode === "login" ? "Entrar a mi espacio" : "Crear mi acceso"} <ArrowRight size={18} />
        </button>
      </form>

      {message ? <div className={`form-message${success ? " success" : ""}`} role="status">{message}</div> : null}

      {!hasSupabaseEnvironment ? (
        <Link className="button button-secondary" style={{ width: "100%", marginTop: 14 }} href="/">
          Entrar en modo local
        </Link>
      ) : null}

      <p className="helper-text" style={{ marginTop: 22, textAlign: "center" }}>
        {mode === "login" ? "¿Es tu primera vez?" : "¿Ya tienes un acceso?"}{" "}
        <Link href={mode === "login" ? "/registro" : "/login"} style={{ color: "var(--etq-azul)", fontWeight: 700 }}>
          {mode === "login" ? "Crear acceso" : "Volver a entrar"}
        </Link>
      </p>
    </div>
  );
}
