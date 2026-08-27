"use client";

import { useCredits } from "../../hooks/useCredits";

export default function CreditsBadge() {
  const { credits, loading } = useCredits();

  if (loading || !credits) return null;

  if (credits.plan === "pro" || credits.plan === "newsroom") {
    return (
      <span className="rounded-full bg-brand-yellow px-3 py-1 text-sm font-bold text-brand-blue">
        ⚡ Pro — Sin límites
      </span>
    );
  }

  return (
    <span className="rounded-full bg-brand-blue px-3 py-1 text-sm font-medium text-white">
      {credits.available} {credits.available === 1 ? "crédito restante hoy" : "créditos restantes hoy"}
    </span>
  );
}
