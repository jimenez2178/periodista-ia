"use client";

import { Smartphone } from "lucide-react";
import { useInstallApp, openInstallGuide } from "../../hooks/useInstallApp";

const VARIANTS = {
  card: "min-h-[44px] w-full justify-center border border-brand-blue/20 bg-white px-4 text-brand-blue hover:bg-brand-blue/5",
  sidebar: "px-3 py-2.5 text-brand-yellow hover:bg-white/10",
};

export default function InstallButton({ variant = "card", className = "", onClick }) {
  const { standalone } = useInstallApp();

  if (standalone) return null;

  function handleClick() {
    onClick?.();
    openInstallGuide();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-3 rounded-brand text-sm font-medium transition-colors ${VARIANTS[variant] || VARIANTS.card} ${className}`}
    >
      <Smartphone size={18} />
      Instalar la app en mi celular
    </button>
  );
}
