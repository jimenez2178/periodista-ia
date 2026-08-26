"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import * as creditsService from "../services/credits.service";

export const CreditsContext = createContext(null);

export function CreditsProvider({ children }) {
  const { user } = useAuth();
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  // TODO: refreshCredits depende del objeto `user` completo, y AuthContext
  // crea un `user` nuevo en cada refreshUser() aunque el contenido no
  // cambie. Eso dispara GET /api/proxy/credits varias veces por
  // navegación (visto en la prueba e2e del dashboard). Arreglar cuando
  // toque optimizar: depender de `user?.id` en vez de `user`, o mover
  // el fetch de créditos a algo con cache/deduplicación.
  const refreshCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }
    try {
      const data = await creditsService.getCredits();
      setCredits(data);
    } catch {
      setCredits(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  return (
    <CreditsContext.Provider value={{ credits, loading, refreshCredits }}>
      {children}
    </CreditsContext.Provider>
  );
}
