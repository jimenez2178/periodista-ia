"use client";

import { useContext } from "react";
import { CreditsContext } from "../context/CreditsContext";

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error("useCredits debe usarse dentro de un CreditsProvider.");
  }
  return context;
}
