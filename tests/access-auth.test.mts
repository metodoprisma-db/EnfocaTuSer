import assert from "node:assert/strict";
import test from "node:test";

import {
  authErrorFeedback,
  authRouteFeedback,
} from "../src/lib/auth-feedback.ts";
import {
  evaluateInternalAccess,
  parseAllowedEmails,
} from "../src/lib/internal-access.ts";

test("la lista interna normaliza correos sin exponer otras variantes", () => {
  assert.deepEqual(
    [...parseAllowedEmails(" Clarissa@Example.com,scarlett@example.com\nCLARISSA@example.com ")],
    ["clarissa@example.com", "scarlett@example.com"],
  );
});

test("el acceso restringido falla cerrado si falta configuración", () => {
  assert.equal(
    evaluateInternalAccess({
      restricted: true,
      allowedEmails: new Set(),
      userEmail: null,
    }),
    "configuration_error",
  );
});

test("el acceso restringido exige sesión y pertenencia a la lista", () => {
  const allowedEmails = parseAllowedEmails("clarissa@example.com,scarlett@example.com");

  assert.equal(
    evaluateInternalAccess({ restricted: true, allowedEmails, userEmail: null }),
    "sign_in_required",
  );
  assert.equal(
    evaluateInternalAccess({
      restricted: true,
      allowedEmails,
      userEmail: "persona@example.com",
    }),
    "not_allowed",
  );
  assert.equal(
    evaluateInternalAccess({
      restricted: true,
      allowedEmails,
      userEmail: "CLARISSA@example.com",
    }),
    "allowed",
  );
});

test("el modo abierto conserva la experiencia local existente", () => {
  assert.equal(
    evaluateInternalAccess({
      restricted: false,
      allowedEmails: new Set(),
      userEmail: null,
    }),
    "open",
  );
});

test("los errores de Auth se explican por código sin filtrar datos sensibles", () => {
  assert.deepEqual(
    authErrorFeedback({ code: "captcha_failed", status: 400 }, "sign_up"),
    {
      message: "La verificación de seguridad no pudo validarse. Complétala otra vez antes de continuar.",
      diagnosticCode: "AUTH-SIGN-UP-CAPTCHA-FAILED-400",
    },
  );
  assert.equal(
    authErrorFeedback({ code: "email_address_not_authorized", status: 400 }, "sign_up").message,
    "Supabase no puede enviar el correo de confirmación a esta dirección con la configuración actual. El equipo debe revisar el servicio de correo.",
  );
  assert.equal(
    authErrorFeedback({ code: "unexpected_failure", status: 500 }, "sign_up").message,
    "La cuenta no pudo crearse por un problema interno de datos. El equipo puede revisar el trigger de perfil con esta referencia.",
  );
  assert.equal(
    authErrorFeedback({ code: "invalid_credentials", status: 400 }, "sign_in").message,
    "El correo o la contraseña no coinciden. Revisa los datos e inténtalo otra vez.",
  );
});

test("los rechazos del acceso interno ofrecen una referencia segura", () => {
  assert.deepEqual(authRouteFeedback("pilot_not_authorized"), {
    message: "Este correo no está habilitado para el piloto interno. Usa el correo con el que recibiste la invitación o consulta al equipo.",
    diagnosticCode: "ACCESS-PILOT-NOT-AUTHORIZED",
  });
  assert.equal(authRouteFeedback("dato-desconocido"), null);
});
