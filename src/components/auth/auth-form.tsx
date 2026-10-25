"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { ArrowRight, LockKeyhole } from "lucide-react";

import {
  authErrorFeedback,
  authRouteFeedback,
  safeAuthDiagnostic,
  type AuthOperation,
} from "@/lib/auth-feedback";
import { hasSupabaseEnvironment } from "@/lib/constants";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export function AuthForm({
  mode,
  initialError = "",
  restrictedAccess = false,
}: {
  mode: "login" | "register";
  initialError?: string;
  restrictedAccess?: boolean;
}) {
  const router = useRouter();
  const initialFeedback = authRouteFeedback(initialError);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaUnavailable, setCaptchaUnavailable] = useState(false);
  const [captchaCycle, setCaptchaCycle] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(initialFeedback?.message ?? "");
  const [diagnosticCode, setDiagnosticCode] = useState(initialFeedback?.diagnosticCode ?? "");
  const [success, setSuccess] = useState(false);
  const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  const captchaRequired = restrictedAccess || Boolean(turnstileKey);
  const canSubmitEmail = hasSupabaseEnvironment &&
    (!captchaRequired || Boolean(captchaToken));

  const resetCaptcha = () => {
    setCaptchaToken("");
    setCaptchaCycle((cycle) => cycle + 1);
  };

  const showAuthError = (error: unknown, operation: AuthOperation) => {
    const safeError = typeof error === "object" && error !== null ? error : {};
    const feedback = authErrorFeedback(safeError, operation);
    console.error("[Enfoca Tu Ser Auth]", safeAuthDiagnostic(safeError, operation));
    setMessage(feedback.message);
    setDiagnosticCode(feedback.diagnosticCode);
    resetCaptcha();
  };

  const validate = () => {
    if (website) {
      setMessage("No pudimos validar el formulario.");
      setDiagnosticCode("AUTH-HONEYPOT-REJECTED");
      return false;
    }
    if (!hasSupabaseEnvironment) {
      setMessage("El acceso en la nube estará disponible cuando se conecte Supabase. Puedes entrar en modo local ahora.");
      setDiagnosticCode("AUTH-SUPABASE-NOT-CONFIGURED");
      return false;
    }
    if (restrictedAccess && !turnstileKey) {
      setMessage("El acceso interno necesita que el equipo complete la configuración de seguridad antes de crear cuentas.");
      setDiagnosticCode("AUTH-TURNSTILE-NOT-CONFIGURED");
      return false;
    }
    if (captchaRequired && !captchaToken) {
      setMessage("Completa la verificación de seguridad para continuar.");
      setDiagnosticCode("AUTH-CAPTCHA-REQUIRED");
      return false;
    }
    return true;
  };

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setDiagnosticCode("");
    setSuccess(false);
    if (!validate()) return;
    const client = getBrowserSupabaseClient();
    if (!client) return;

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken },
        });
        if (error) {
          showAuthError(error, "sign_in");
          return;
        }
        router.push("/");
        router.refresh();
        return;
      }

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          captchaToken,
          data: { display_name: displayName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        showAuthError(error, "sign_up");
        return;
      }

      setSuccess(true);
      setDiagnosticCode("");
      resetCaptcha();
      if (data.session) {
        router.push("/");
        router.refresh();
        return;
      }
      setMessage("Revisa tu correo para confirmar la cuenta y abrir tu espacio sincronizado.");
    } catch (error) {
      showAuthError(error, mode === "login" ? "sign_in" : "sign_up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <span className="eyebrow">{mode === "login" ? "Volver a tu espacio" : "Guardar tu recorrido"}</span>
      <h2>{mode === "login" ? "Qué bueno verte" : "Crea tu acceso"}</h2>
      <p>
        {mode === "login"
          ? restrictedAccess
            ? "Entra con el correo habilitado para el piloto y recupera tu recorrido en cualquier dispositivo."
            : "Sincroniza tus notas y avances entre dispositivos."
          : restrictedAccess
            ? "Usa el mismo correo al que el equipo envió la invitación."
            : "Tu progreso local se unirá a tu cuenta después del primer acceso."}
      </p>

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
              key={captchaCycle}
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
          <p className={`pilot-access-note${restrictedAccess ? " configuration-error" : ""}`}>
            <LockKeyhole size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />
            {restrictedAccess
              ? "Configuración pendiente: falta conectar la verificación de seguridad de este despliegue."
              : "La verificación visual no está configurada en este entorno."}
          </p>
        )}

        <button className="button button-primary" style={{ width: "100%", marginTop: 20 }} type="submit" disabled={loading || !canSubmitEmail}>
          {loading ? "Preparando..." : mode === "login" ? "Entrar a mi espacio" : "Crear mi acceso"} <ArrowRight size={18} />
        </button>
      </form>

      {message ? (
        <div className={`form-message${success ? " success" : ""}`} role="status">
          {message}
          {diagnosticCode ? <small>Referencia segura: {diagnosticCode}</small> : null}
        </div>
      ) : null}

      {!restrictedAccess ? (
        <div className={`guest-access${captchaUnavailable ? " highlighted" : ""}`}>
          <span className="eyebrow">Camino de prueba</span>
          <p>Puedes explorar el piloto sin crear una cuenta. El avance quedará guardado solo en este dispositivo y podrás vincularlo más adelante.</p>
          <Link className="button button-secondary" href="/">
            Continuar como invitada <ArrowRight size={18} />
          </Link>
        </div>
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
