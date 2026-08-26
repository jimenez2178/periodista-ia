"use client";

import { useAuth } from "../../../hooks/useAuth";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg">
      <h1 className="text-2xl font-bold text-brand-text">
        Bienvenido, {user?.full_name || user?.email}
      </h1>
    </main>
  );
}
