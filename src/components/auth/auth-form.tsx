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
import { hasSupabaseEnvironment, SUPPORT_URL } from "@/lib/constants";
import { membershipOffer } from "@/data/membership-offer";
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
      setMessage(restrictedAccess ? "El equipo está preparando el acceso con cuenta. Puedes pedir ayuda con la referencia que aparece abajo." : "El acceso con cuenta aún está en preparación. Puedes tocar «Continuar como invitada» y conservar tu recorrido en este dispositivo.");
      setDiagnosticCode("AUTH-SUPABASE-NOT-CONFIGURED");
      return false;
    }
    if (restrictedAccess && !turnstileKey) {
      setMessage("El equipo está preparando el acceso del piloto. Puedes pedir ayuda con la referencia que aparece abajo.");
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
      setMessage("Te enviamos un correo de confirmación. Abre el mensaje y toca el enlace para confirmar tu cuenta. Si no lo encuentras, revisa la carpeta de correo no deseado. Después podrás volver a entrar con tu correo y contraseña.");
    } catch (error) {
      showAuthError(error, mode === "login" ? "sign_in" : "sign_up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <span className="eyebrow">{mode === "login" ? "Volver a tu espacio" : "Conservar tu recorrido"}</span>
      <h2>{mode === "login" ? "Qué bueno que regresaste" : "Crea tu cuenta"}</h2>
      <p>
        {mode === "login"
          ? restrictedAccess
            ? "Entra con el correo habilitado para el piloto y recupera tu recorrido en cualquier dispositivo."
            : "Escribe el correo y la contraseña con los que creaste tu cuenta para recuperar tus notas y avances."
          : restrictedAccess
            ? "Usa el mismo correo al que el equipo envió la invitación."
            : "Escribe cómo quieres que te llamemos, tu correo y una contraseña de al menos ocho caracteres. Así podrás recuperar tus notas y avances al entrar con esta cuenta en otro dispositivo."}
      </p>
      {mode === "register" && !restrictedAccess ? <p className="helper-text">Empieza con {membershipOffer.trialLabel}. {membershipOffer.continuation}</p> : null}

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
          {mode === "register" ? <p className="helper-text">Elige al menos ocho caracteres. Usa una contraseña que puedas recordar y que no compartas con otras personas.</p> : null}
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
                setMessage(restrictedAccess ? "La verificación de seguridad no pudo cargarse. Puedes recargar la página o pedir ayuda al equipo." : "La verificación de seguridad no pudo cargarse. Puedes recargar la página o tocar «Continuar como invitada».");
              }}
              options={{ theme: "light", language: "es" }}
            />
          </div>
        ) : (
          <p className={`pilot-access-note${restrictedAccess ? " configuration-error" : ""}`}>
            <LockKeyhole size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />
            {restrictedAccess
              ? "El equipo está preparando la verificación de acceso. Si necesitas ayuda, encontrarás el enlace más abajo."
              : "Puedes probar los ejercicios sin crear una cuenta. Tus notas y avances quedarán en este dispositivo."}
          </p>
        )}

        <button className="button button-primary" style={{ width: "100%", marginTop: 20 }} type="submit" disabled={loading || !canSubmitEmail}>
          {loading ? "Preparando tu espacio..." : mode === "login" ? "Entrar a mi espacio" : "Crear mi cuenta"} <ArrowRight size={18} />
        </button>
      </form>

      {message ? (
        <div className={`form-message${success ? " success" : ""}`} role="status">
          {message}
          {diagnosticCode ? <small>Si pides ayuda al equipo, comparte esta referencia: {diagnosticCode}</small> : null}
        </div>
      ) : null}

      {!restrictedAccess ? (
        <div className={`guest-access${captchaUnavailable ? " highlighted" : ""}`}>
          <span className="eyebrow">Probar sin crear una cuenta</span>
          <p>Puedes conocer este espacio sin crear una cuenta. Tu avance quedará en este navegador y dispositivo. Para recuperarlo en otro dispositivo, vuelve aquí y crea una cuenta que permita conservarlo en ambos.</p>
          <Link className="button button-secondary" href="/">
            Continuar como invitada <ArrowRight size={18} />
          </Link>
        </div>
      ) : null}

      <p className="helper-text" style={{ marginTop: 22, textAlign: "center" }}>
        {mode === "login" ? "¿Es tu primera vez?" : "¿Ya tienes un acceso?"}{" "}
        <Link href={mode === "login" ? "/registro" : "/login"} style={{ color: "var(--etq-azul)", fontWeight: 700 }}>
          {mode === "login" ? "Crear mi cuenta" : "Volver a entrar"}
        </Link>
      </p>
      <a className="support-link" href={SUPPORT_URL} target="_blank" rel="noreferrer">Escribe aquí y nuestro equipo te ayudará con gusto</a>
    </div>
  );
}
