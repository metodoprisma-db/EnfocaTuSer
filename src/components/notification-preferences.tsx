"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Check, Info } from "lucide-react";

import { useAppState } from "@/context/app-state";
import { discoveries } from "@/data/catalog";

type PermissionState = NotificationPermission | "unsupported";

export function AvailabilityNotice() {
  const { meta, state } = useAppState();
  const nextIndex = meta.progression.nextDiscoveryIndex;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    const updateVisibility = (nextVisible: boolean) => {
      queueMicrotask(() => {
        if (active) setVisible(nextVisible);
      });
    };
    if (
      nextIndex === null ||
      meta.progression.discoveriesCompleted === 0 ||
      meta.progression.discoveryStatus(nextIndex) !== "available"
    ) {
      updateVisibility(false);
      return () => {
        active = false;
      };
    }
    const key = `enfoca-tu-ser:unlock-notice:${nextIndex}`;
    if (window.sessionStorage.getItem(key)) {
      updateVisibility(false);
      return () => {
        active = false;
      };
    }
    window.sessionStorage.setItem(key, "shown");
    updateVisibility(true);

    if (
      state.data.profile.reminderEnabled &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      void navigator.serviceWorker?.ready.then((registration) =>
        registration.showNotification("Enfoca Tu Ser", {
          body: "Tu próximo descubrimiento ya está disponible cuando quieras volver.",
          icon: "/icon-512.png",
          badge: "/icon-192.png",
          tag: `discovery-${nextIndex + 1}`,
        }),
      );
    }
    return () => {
      active = false;
    };
  }, [meta.progression, nextIndex, state.data.profile.reminderEnabled]);

  if (!visible || nextIndex === null) return null;
  return (
    <aside className="availability-notice" aria-live="polite">
      <BellRing size={20} aria-hidden="true" />
      <div>
        <strong>Tu próximo descubrimiento ya está disponible</strong>
        <span>{discoveries[nextIndex]?.title}. Puedes abrirlo cuando te venga bien.</span>
      </div>
      <button type="button" onClick={() => setVisible(false)}>Cerrar</button>
    </aside>
  );
}

export function NotificationPreferences() {
  const { actions, state } = useAppState();
  const [permission, setPermission] = useState<PermissionState>("unsupported");

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setPermission("Notification" in window ? Notification.permission : "unsupported");
    });
    return () => {
      active = false;
    };
  }, []);

  const updateSystemNotifications = async (enabled: boolean) => {
    if (!enabled) {
      actions.setReminderEnabled(false);
      return;
    }
    if (!("Notification" in window)) return;
    const nextPermission = Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
    setPermission(nextPermission);
    actions.setReminderEnabled(nextPermission === "granted");
  };

  return (
    <section className="notification-settings" aria-labelledby="notification-title">
      <div className="notification-copy">
        <span className="eyebrow"><Bell size={15} /> Avisos serenos</span>
        <h2 id="notification-title">Volver cuando el momento esté disponible</h2>
        <p>
          El aviso no revela lo que escribiste ni repite recordatorios. La fecha exacta siempre queda visible en Mi espacio.
        </p>
      </div>
      <label className="preference-toggle">
        <input
          type="checkbox"
          checked={state.data.profile.reminderEnabled}
          onChange={(event) => void updateSystemNotifications(event.target.checked)}
        />
        <span>
          <strong>Quiero un aviso adicional del dispositivo</strong>
          <small>Solo se pedirá permiso al activar esta opción.</small>
        </span>
      </label>
      {permission === "granted" ? (
        <p className="permission-status"><Check size={16} /> El permiso está activo. Durante el piloto, este aviso requiere que la aplicación siga abierta.</p>
      ) : permission === "denied" ? (
        <p className="permission-status"><Info size={16} /> El navegador bloqueó los avisos del dispositivo. Los avisos dentro de la aplicación siguen disponibles.</p>
      ) : permission === "default" ? (
        <p className="permission-status"><Info size={16} /> La aplicación todavía no solicitó permisos.</p>
      ) : (
        <p className="permission-status"><Info size={16} /> Este navegador no ofrece avisos del dispositivo.</p>
      )}
    </section>
  );
}
