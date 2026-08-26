"use client";

import { useCredits } from "../../hooks/useCredits";

export default function CreditsBadge() {
  const { credits, loading } = useCredits();

  if (loading || !credits) return null;

  return (
    <span className="rounded-full bg-brand-yellow/20 px-3 py-1 text-sm font-medium text-brand-blue">
      {credits.available} {credits.available === 1 ? "crédito restante hoy" : "créditos restantes hoy"}
    </span>
  );
}
