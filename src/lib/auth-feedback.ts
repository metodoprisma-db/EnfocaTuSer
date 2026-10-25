export type AuthOperation = "sign_in" | "sign_up";

export interface AuthErrorLike {
  code?: string;
  message?: string;
  name?: string;
  status?: number;
}

export interface AuthFeedback {
  message: string;
  diagnosticCode: string;
}

export function authRouteFeedback(code: string | undefined): AuthFeedback | null {
  switch (code) {
    case "pilot_configuration":
      return {
        message: "El acceso interno todavía no está configurado por completo. El equipo debe revisar las variables privadas del despliegue.",
        diagnosticCode: "ACCESS-PILOT-CONFIGURATION",
      };
    case "pilot_not_authorized":
      return {
        message: "Este correo no está habilitado para el piloto interno. Usa el correo con el que recibiste la invitación o consulta al equipo.",
        diagnosticCode: "ACCESS-PILOT-NOT-AUTHORIZED",
      };
    case "session_required":
      return {
        message: "Entra con tu cuenta autorizada para abrir el piloto interno.",
        diagnosticCode: "ACCESS-SESSION-REQUIRED",
      };
    case "auth":
      return {
        message: "El enlace de acceso no pudo confirmarse o ya venció. Solicita uno nuevo desde el registro.",
        diagnosticCode: "AUTH-CALLBACK-FAILED",
      };
    default:
      return null;
  }
}

function diagnosticSegment(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();
}

function messageForCode(code: string, operation: AuthOperation) {
  switch (code) {
    case "captcha_failed":
      return "La verificación de seguridad no pudo validarse. Complétala otra vez antes de continuar.";
    case "email_provider_disabled":
      return "El acceso con correo está deshabilitado en Supabase. El equipo debe habilitarlo antes de crear cuentas.";
    case "signup_disabled":
      return "La creación de cuentas está deshabilitada en Supabase. El equipo debe habilitar nuevos registros.";
    case "email_address_not_authorized":
      return "Supabase no puede enviar el correo de confirmación a esta dirección con la configuración actual. El equipo debe revisar el servicio de correo.";
    case "over_email_send_rate_limit":
      return "Se alcanzó temporalmente el límite de correos de acceso. Espera unos minutos antes de volver a intentarlo.";
    case "over_request_rate_limit":
      return "Hubo varios intentos seguidos. Espera unos minutos antes de volver a intentarlo.";
    case "email_not_confirmed":
      return "Tu correo todavía no está confirmado. Abre el mensaje de confirmación y vuelve a entrar.";
    case "invalid_credentials":
      return "El correo o la contraseña no coinciden. Revisa los datos e inténtalo otra vez.";
    case "weak_password":
      return "La contraseña necesita ser más segura. Usa al menos ocho caracteres y evita datos fáciles de adivinar.";
    case "email_address_invalid":
    case "validation_failed":
      return "Revisa que el correo sea válido y que la contraseña tenga al menos ocho caracteres.";
    case "email_exists":
    case "user_already_exists":
      return "Si ya creaste una cuenta con este correo, vuelve a la pantalla de ingreso.";
    case "unexpected_failure":
      return "La cuenta no pudo crearse por un problema interno de datos. El equipo puede revisar el trigger de perfil con esta referencia.";
    default:
      return operation === "sign_in"
        ? "No pudimos abrir tu espacio. Revisa los datos y comparte la referencia con el equipo si vuelve a ocurrir."
        : "No pudimos crear la cuenta. Comparte la referencia con el equipo para revisar la configuración de acceso.";
  }
}

export function authErrorFeedback(
  error: AuthErrorLike,
  operation: AuthOperation,
): AuthFeedback {
  const rawCode = error.code?.trim() ||
    (/fetch|network/i.test(error.message ?? "") ? "network_error" : "unknown");
  const operationCode = operation === "sign_in" ? "SIGN-IN" : "SIGN-UP";
  const errorCode = diagnosticSegment(rawCode) || "UNKNOWN";
  const statusCode = Number.isInteger(error.status) ? `-${error.status}` : "";

  return {
    message: rawCode === "network_error"
      ? "No pudimos comunicarnos con el servicio de acceso. Revisa tu conexión e inténtalo otra vez."
      : messageForCode(rawCode, operation),
    diagnosticCode: `AUTH-${operationCode}-${errorCode}${statusCode}`,
  };
}

export function safeAuthDiagnostic(error: AuthErrorLike, operation: AuthOperation) {
  return {
    operation,
    code: error.code ?? "unknown",
    status: error.status ?? null,
    errorType: error.name ?? "AuthError",
  };
}
