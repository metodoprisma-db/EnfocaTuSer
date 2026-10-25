"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // La instalación sigue siendo utilizable aunque el navegador rechace el registro.
    });
  }, []);

  return null;
}
