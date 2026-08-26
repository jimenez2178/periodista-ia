import Link from "next/link";
import Button from "../ui/Button";

export default function UpgradePrompt() {
  return (
    <div className="rounded-brand border border-brand-yellow bg-brand-yellow/10 p-4 text-center">
      <p className="font-medium text-brand-text">Se te acabaron los créditos de hoy.</p>
      <p className="mt-1 text-sm text-brand-text/70">
        Actualiza tu plan para seguir usando PeriodistaIA sin límites diarios.
      </p>
      <Link href="/billing">
        <Button variant="secondary" className="mt-3">
          Ver planes y mejorar →
        </Button>
      </Link>
    </div>
  );
}
