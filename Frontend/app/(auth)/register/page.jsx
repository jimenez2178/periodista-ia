"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } from "../../../utils/validators";
import { COUNTRIES } from "../../../utils/constants";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timeout = setTimeout(() => router.push("/login"), 2500);
    return () => clearTimeout(timeout);
  }, [success, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Ingresa tu nombre completo.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Ingresa un email válido.");
      return;
    }
    if (!isValidPassword(password)) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (!country) {
      setError("Selecciona tu país.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ email, password, full_name: fullName, country });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-2xl font-bold text-brand-text">¡Cuenta creada!</h2>
        <p className="text-sm text-brand-text/70">
          Revisa tu correo para confirmar tu cuenta. Te llevamos al login...
        </p>
        <Link href="/login" className="font-medium text-brand-blue hover:underline">
          Ir al login ahora
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-brand-text">Crear cuenta</h2>
        <p className="mt-1 text-sm text-brand-text/70">Únete a PeriodistaIA.</p>
      </div>

      <Input
        id="full_name"
        label="Nombre completo"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Tu nombre"
        autoComplete="name"
      />
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
        autoComplete="new-password"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="country" className="text-sm font-medium text-brand-text">
          País
        </label>
        <select
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-brand border border-brand-border px-3 py-2.5 text-brand-text outline-none focus:border-brand-blue"
        >
          <option value="">Selecciona tu país</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-brand-error">{error}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-brand-text/70">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-brand-blue hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
