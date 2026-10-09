"use client";

import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { useInstallApp, openInstallGuide } from "../../hooks/useInstallApp";

const DISMISSED_KEY = "install-banner-dismissed";

export default function InstallBanner() {
  const { standalone } = useInstallApp();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISSED_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function handleDismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Sin almacenamiento disponible: se oculta solo durante esta visita.
    }
  }

  if (standalone || dismissed) return null;

  return (
    <div className="flex items-center gap-3 bg-brand-blue px-4 py-2 text-white md:px-8">
      <Smartphone size={20} className="shrink-0 text-brand-yellow" />
      <p className="flex-1 text-sm font-medium">Instala PeriodistaIA en tu celular</p>
      <button
        type="button"
        onClick={openInstallGuide}
        className="flex min-h-[36px] shrink-0 items-center rounded-brand bg-brand-yellow px-3 text-sm font-bold text-brand-blue transition-colors hover:bg-brand-yellow/90"
      >
        Ver cómo
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Ocultar aviso de instalación"
        className="flex h-9 w-9 shrink-0 items-center justify-center text-white/70 hover:text-white"
      >
        <X size={18} />
      </button>
    </div>
  );
}
