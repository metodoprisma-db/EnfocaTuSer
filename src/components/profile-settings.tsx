"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, MapPin, Settings2, X } from "lucide-react";

import { useAppState } from "@/context/app-state";
import { TIMEZONE_PROMPT_STORAGE_KEY } from "@/lib/constants";

const fallbackTimezones = [
  "America/Argentina/Buenos_Aires",
  "America/Bogota",
  "America/Caracas",
  "America/Lima",
  "America/Mexico_City",
  "America/New_York",
  "America/Santiago",
  "Europe/Madrid",
  "UTC",
];

function detectedTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function friendlyTimezone(timezone: string) {
  return timezone.replaceAll("_", " ").replaceAll("/", " · ");
}

export function ProfileSettings() {
  const { state, actions } = useAppState();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [timezonePromptDismissed, setTimezonePromptDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(TIMEZONE_PROMPT_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [doNotAsk, setDoNotAsk] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState(
    state.data.profile.timezone ?? detectedTimezone(),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const currentDetectedTimezone = detectedTimezone();
  const timezonePromptOpen = Boolean(
    state.hydrated &&
      state.data.profile.timezone &&
      !timezonePromptDismissed &&
      state.data.profile.timezone !== currentDetectedTimezone,
  );

  const timezones = useMemo(() => {
    const intlWithZones = Intl as typeof Intl & {
      supportedValuesOf?: (key: "timeZone") => string[];
    };
    return intlWithZones.supportedValuesOf?.("timeZone") ?? fallbackTimezones;
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
        setTimezonePromptDismissed(true);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const rememberChoice = () => {
    if (!doNotAsk) return;
    try {
      window.localStorage.setItem(TIMEZONE_PROMPT_STORAGE_KEY, "true");
    } catch {
      // La decisión se conserva solo durante esta visita si storage no está disponible.
    }
  };

  const updateToDetected = async () => {
    setSaving(true);
    setMessage("");
    try {
      await actions.updateTimezone(currentDetectedTimezone, false);
      rememberChoice();
      setTimezonePromptDismissed(true);
    } catch {
      setMessage("No pudimos actualizar la zona. Puedes intentarlo desde Ajustes.");
    } finally {
      setSaving(false);
    }
  };

  const keepPrevious = () => {
    rememberChoice();
    setTimezonePromptDismissed(true);
  };

  const saveManual = async () => {
    setSaving(true);
    setMessage("");
    try {
      await actions.updateTimezone(selectedTimezone, true);
      setMessage("Tu zona horaria quedó actualizada.");
    } catch {
      setMessage("No pudimos guardar esa zona horaria. Elige otra e inténtalo nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        className="auth-link settings-trigger"
        type="button"
        onClick={() => {
          setSelectedTimezone(state.data.profile.timezone ?? currentDetectedTimezone);
          setSettingsOpen(true);
        }}
      >
        <Settings2 size={17} /> Ajustes
      </button>

      {timezonePromptOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-card timezone-modal" role="dialog" aria-modal="true" aria-labelledby="timezone-prompt-title">
            <span className="modal-icon"><MapPin size={24} /></span>
            <span className="eyebrow">Tu horario puede acompañarte mejor</span>
            <h2 id="timezone-prompt-title">Parece que estás en otra zona horaria</h2>
            <p>
              Tienes guardada <strong>{friendlyTimezone(state.data.profile.timezone ?? "UTC")}</strong> y
              tu navegador detecta <strong>{friendlyTimezone(currentDetectedTimezone)}</strong>.
            </p>
            <p className="helper-text">
              Puedes mantener la anterior o actualizar a tu ciudad actual. Siempre podrás cambiarla manualmente en Mi Perfil / Ajustes.
            </p>
            <label className="check-row">
              <input type="checkbox" checked={doNotAsk} onChange={(event) => setDoNotAsk(event.target.checked)} />
              <span>No volver a preguntar</span>
            </label>
            {message ? <p className="form-message" role="alert">{message}</p> : null}
            <div className="button-row">
              <button className="button button-primary" type="button" onClick={updateToDetected} disabled={saving}>
                <MapPin size={17} /> Actualizar a mi zona actual
              </button>
              <button className="button button-secondary" type="button" onClick={keepPrevious} disabled={saving}>
                Mantener la zona anterior
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {settingsOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="profile-settings-title">
            <button className="modal-close" type="button" aria-label="Cerrar ajustes" onClick={() => setSettingsOpen(false)}>
              <X size={20} />
            </button>
            <span className="eyebrow"><Clock3 size={15} /> Mi Perfil / Ajustes</span>
            <h2 id="profile-settings-title">Tu zona horaria</h2>
            <p>
              La usamos para contar tus días de presencia según el lugar donde estás, sin pedir información de ubicación.
            </p>
            <div className="field">
              <label htmlFor="manual-timezone">Zona horaria</label>
              <select id="manual-timezone" value={selectedTimezone} onChange={(event) => setSelectedTimezone(event.target.value)}>
                {timezones.map((timezone) => (
                  <option key={timezone} value={timezone}>{friendlyTimezone(timezone)}</option>
                ))}
              </select>
            </div>
            {message ? <p className="form-message success" role="status">{message}</p> : null}
            <div className="button-row">
              <button className="button button-primary" type="button" onClick={saveManual} disabled={saving}>
                {saving ? "Guardando..." : "Guardar zona horaria"}
              </button>
              <button className="button button-quiet" type="button" onClick={() => setSettingsOpen(false)}>Cerrar</button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
