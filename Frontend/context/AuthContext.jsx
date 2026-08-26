"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import * as authService from "../services/auth.service";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authService.me();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email, password) => {
      await authService.login(email, password);
      // El login del backend devuelve el usuario crudo de Supabase Auth
      // (sin full_name/country/plan). Volvemos a pedir /me para tener el
      // perfil combinado con public.users.
      return refreshUser();
    },
    [refreshUser],
  );

  const register = useCallback(async (payload) => {
    return authService.register(payload);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
