"use client";

import { useEffect, useState } from "react";

const PREFIX = "pia:prefill:";

export function usePrefilledInput(key) {
  const [value, setValue] = useState("");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(PREFIX + key);
      if (stored) {
        setValue(stored);
        sessionStorage.removeItem(PREFIX + key);
      }
    } catch {
      // sessionStorage no disponible (ej. modo privado) — sin pre-llenado, sin romper la página.
    }
  }, [key]);

  return value;
}

export function setPrefilledInput(key, value) {
  try {
    sessionStorage.setItem(PREFIX + key, value);
  } catch {
    // sessionStorage no disponible — la navegación sigue funcionando, solo sin pre-llenado.
  }
}
