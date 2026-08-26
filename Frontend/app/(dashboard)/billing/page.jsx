"use client";

import { useAuth } from "../../../hooks/useAuth";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

const PAYPAL_URL = "https://www.paypal.com/ncp/payment/7SU7K8LUPGFXN";

export default function BillingPage() {
  const { user } = useAuth();
  const isPro = user?.plan === "pro";

  if (isPro) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-brand-text">Planes de PeriodistaIA</h1>
        <Card variant="elevated" className="w-full">
          <p className="font-bold text-brand-blue">⚡ Ya eres usuario Pro</p>
          <p className="mt-2 text-sm text-brand-text/70">
            Tienes consultas ilimitadas, audio sin límite, historial completo y proyectos guardados.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-text">Planes de PeriodistaIA</h1>
        <p className="mt-1 text-sm text-brand-text/70">Elige el plan que mejor se adapte a tu trabajo.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card variant="elevated" className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-brand-text">Gratis</h2>
          <p className="text-2xl font-bold text-brand-text">$0</p>
          <ul className="flex flex-1 flex-col gap-2 text-sm text-brand-text/70">
            <li>✓ 5 consultas diarias</li>
            <li>✓ Funciones básicas</li>
            <li>✓ Límite de 2 minutos en audio</li>
          </ul>
        </Card>

        <Card variant="elevated" className="flex flex-col gap-3 ring-2 ring-brand-yellow">
          <h2 className="text-lg font-bold text-brand-text">Pro</h2>
          <p className="text-2xl font-bold text-brand-text">
            $12<span className="text-sm font-normal text-brand-text/60">/mes</span>
          </p>
          <ul className="flex flex-1 flex-col gap-2 text-sm text-brand-text/70">
            <li>✓ Consultas ilimitadas</li>
            <li>✓ Audio sin límite</li>
            <li>✓ Historial completo</li>
            <li>✓ Proyectos guardados</li>
          </ul>
          <a href={PAYPAL_URL} target="_blank" rel="noopener noreferrer">
            <Button className="w-full">Comenzar ahora →</Button>
          </a>
        </Card>
      </div>
    </div>
  );
}
