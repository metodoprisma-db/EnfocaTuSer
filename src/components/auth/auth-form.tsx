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
  const [captchaUnavailable, setCaptchaUnavailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(initialError ? "No pudimos completar el acceso. Inténtalo otra vez." : "");
  const [success, setSuccess] = useState(false);
  const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  const canSubmitEmail = hasSupabaseEnvironment && (!turnstileKey || Boolean(captchaToken));

  const validate = () => {
    if (website) {
      setMessage("No pudimos validar el formulario.");
      return false;
    }
    if (!hasSupabaseEnvironment) {
      setMessage("El acceso en la nube estará disponible cuando se conecte Supabase. Puedes entrar en modo local ahora.");
      return false;
    }
    if (turnstileKey && !captchaToken) {
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
      setMessage("El registro sincronizado no está disponible en este momento. Puedes continuar como invitada y conservar el recorrido en este dispositivo.");
      return;
    }
    setSuccess(true);
    setMessage("Revisa tu correo para confirmar la cuenta y abrir tu espacio sincronizado.");
  };

  const signInWithGoogle = async () => {
    setMessage("");
    if (!hasSupabaseEnvironment) {
      setMessage("La sincronización todavía no está disponible. Puedes continuar como invitada.");
      return;
    }
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

      <button className="button button-secondary" style={{ width: "100%" }} type="button" onClick={signInWithGoogle} disabled={loading || !hasSupabaseEnvironment}>
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
              onSuccess={(token) => {
                setCaptchaToken(token);
                setCaptchaUnavailable(false);
              }}
              onExpire={() => setCaptchaToken("")}
              onError={() => {
                setCaptchaToken("");
                setCaptchaUnavailable(true);
                setMessage("La verificación de seguridad no pudo cargarse. Puedes recargar la página o continuar como invitada.");
              }}
              options={{ theme: "light", language: "es" }}
            />
          </div>
        ) : (
          <p className="pilot-access-note">
            <LockKeyhole size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />
            Piloto interno: la cuenta se intentará crear sin verificación visual. Si la protección remota la rechaza, podrás recorrer la experiencia como invitada.
          </p>
        )}

        <button className="button button-primary" style={{ width: "100%", marginTop: 20 }} type="submit" disabled={loading || !canSubmitEmail}>
          {loading ? "Preparando..." : mode === "login" ? "Entrar a mi espacio" : "Crear mi acceso"} <ArrowRight size={18} />
        </button>
      </form>

      {message ? <div className={`form-message${success ? " success" : ""}`} role="status">{message}</div> : null}

      <div className={`guest-access${captchaUnavailable ? " highlighted" : ""}`}>
        <span className="eyebrow">Camino de prueba</span>
        <p>Puedes explorar el piloto sin crear una cuenta. El avance quedará guardado solo en este dispositivo y podrás vincularlo más adelante.</p>
        <Link className="button button-secondary" href="/">
          Continuar como invitada <ArrowRight size={18} />
        </Link>
      </div>

      <p className="helper-text" style={{ marginTop: 22, textAlign: "center" }}>
        {mode === "login" ? "¿Es tu primera vez?" : "¿Ya tienes un acceso?"}{" "}
        <Link href={mode === "login" ? "/registro" : "/login"} style={{ color: "var(--etq-azul)", fontWeight: 700 }}>
          {mode === "login" ? "Crear acceso" : "Volver a entrar"}
        </Link>
      </p>
    </div>
  );
}
