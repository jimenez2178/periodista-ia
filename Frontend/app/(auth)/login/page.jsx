"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { isValidEmail } from "../../../utils/validators";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Ingresa un email válido.");
      return;
    }
    if (!password) {
      setError("Ingresa tu contraseña.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-brand-text">Entrar</h2>
        <p className="mt-1 text-sm text-brand-text/70">Accede a tu cuenta de PeriodistaIA.</p>
      </div>

      <Input
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        autoComplete="email"
      />
      <Input
        id="password"
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
      />

      {error && <p className="text-sm text-brand-error">{error}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-sm text-brand-text/70">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-brand-blue hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
