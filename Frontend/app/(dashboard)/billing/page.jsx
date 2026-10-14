"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { clearUrlParam } from "../../../hooks/useUrlParam";
import * as paymentsService from "../../../services/payments.service";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";

// Al volver de PayPal la suscripcion puede tardar unos segundos en quedar
// activa: se reintenta la confirmacion durante ~15 segundos.
const CONFIRM_ATTEMPTS = 6;
const CONFIRM_INTERVAL_MS = 2500;

function formatDate(isoDate) {
  if (!isoDate) return null;
  return new Date(isoDate).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function BillingPage() {
  const { user, refreshUser } = useAuth();
  const isPro = user?.plan === "pro";
  const status = user?.subscription_status;
  const expiresOn = formatDate(user?.plan_expires_at);

  const [starting, setStarting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "success" | "info" | "error", text }
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const returnHandled = useRef(false);

  // Vuelta desde PayPal: ?suscripcion=volver&subscription_id=... o ?suscripcion=abandonada
  useEffect(() => {
    if (returnHandled.current) return;
    returnHandled.current = true;

    const params = new URLSearchParams(window.location.search);
    const result = params.get("suscripcion");
    const subscriptionId = params.get("subscription_id");
    ["suscripcion", "subscription_id", "ba_token", "token"].forEach(clearUrlParam);

    if (result === "abandonada") {
      setNotice({ type: "info", text: "No se completó la suscripción. No se te cobró nada." });
      return;
    }
    if (result !== "volver" || !subscriptionId) return;

    (async () => {
      setConfirming(true);
      try {
        for (let attempt = 0; attempt < CONFIRM_ATTEMPTS; attempt++) {
          const { status: confirmed } = await paymentsService.confirmSubscription(subscriptionId);
          if (confirmed === "active") {
            // Al cambiar el usuario, CreditsContext vuelve a pedir los créditos solo.
            await refreshUser();
            setNotice({ type: "success", text: "¡Listo! Tu suscripción Pro está activa." });
            return;
          }
          if (confirmed !== "pending") break;
          await wait(CONFIRM_INTERVAL_MS);
        }
        setNotice({
          type: "error",
          text: "PayPal todavía no confirma tu suscripción. Si en unos minutos no ves el plan Pro, escríbenos y lo revisamos.",
        });
      } catch (err) {
        setNotice({ type: "error", text: err.message });
      } finally {
        setConfirming(false);
      }
    })();
  }, [refreshUser]);

  async function handleSubscribe() {
    setStarting(true);
    setNotice(null);
    try {
      const { approve_url } = await paymentsService.startSubscription();
      window.location.href = approve_url;
    } catch (err) {
      setNotice({ type: "error", text: err.message });
      setStarting(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    setCancelError("");
    try {
      await paymentsService.cancelSubscription();
      await refreshUser();
      setCancelOpen(false);
      setNotice({ type: "info", text: "Cancelaste tu suscripción. No se te volverá a cobrar." });
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(false);
    }
  }

  const noticeBox = notice && (
    <p
      className={`w-full rounded-brand p-3 text-sm ${
        notice.type === "error"
          ? "bg-brand-error/10 text-brand-error"
          : notice.type === "success"
            ? "bg-brand-blue/10 text-brand-blue"
            : "bg-brand-yellow/20 text-brand-text"
      }`}
    >
      {notice.text}
    </p>
  );

  if (confirming) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-brand-text">Activando tu suscripción…</h1>
        <p className="text-sm text-brand-text/70">Estamos confirmando el pago con PayPal. Esto tarda unos segundos.</p>
      </div>
    );
  }

  const subscribeButton = (label) => (
    <Button className="w-full" onClick={handleSubscribe} disabled={starting}>
      {starting ? "Abriendo PayPal..." : label}
    </Button>
  );

  if (isPro) {
    const hasCancellableSubscription = ["active", "past_due", "suspended"].includes(status);

    let statusText = "Tienes consultas ilimitadas, audio sin límite, historial completo y proyectos guardados.";
    if (status === "active" && expiresOn) statusText = `Tu suscripción se renueva automáticamente el ${expiresOn}.`;
    if (status === "past_due")
      statusText = `No pudimos cobrar el último pago. PayPal lo volverá a intentar; revisa tu método de pago en PayPal. Tu plan Pro sigue activo hasta el ${expiresOn}.`;
    if (status === "suspended")
      statusText = `Tu suscripción está en pausa en PayPal. Tu plan Pro sigue activo hasta el ${expiresOn}.`;
    if (status === "cancelled")
      statusText = `Cancelaste tu suscripción: no se te volverá a cobrar. Sigues con Pro hasta el ${expiresOn}.`;
    if (!status && expiresOn)
      statusText = `Tu plan Pro termina el ${expiresOn}. Suscríbete por $12 al mes para no perderlo.`;

    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-brand-text">Planes de PeriodistaIA</h1>
        {noticeBox}
        <Card variant="elevated" className="flex w-full flex-col gap-3">
          <p className="font-bold text-brand-blue">⚡ Ya eres usuario Pro</p>
          <p className="text-sm text-brand-text/70">{statusText}</p>
          {(status === "cancelled" || (!status && expiresOn)) && subscribeButton("Suscribirme – $12/mes")}
          {hasCancellableSubscription && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="text-sm text-brand-text/60 underline hover:text-brand-error"
            >
              Cancelar suscripción
            </button>
          )}
        </Card>

        <Modal open={cancelOpen} onClose={() => !cancelling && setCancelOpen(false)} title="¿Cancelar tu suscripción?">
          <div className="flex flex-col gap-4 text-left">
            <p className="text-sm text-brand-text/70">
              No se te volverá a cobrar. Conservas el plan Pro hasta el {expiresOn || "final del periodo pagado"} y
              después tu cuenta pasa al plan Gratis.
            </p>
            {cancelError && <p className="text-sm text-brand-error">{cancelError}</p>}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="secondary"
                onClick={() => setCancelOpen(false)}
                disabled={cancelling}
                className="w-full sm:w-auto"
              >
                Mantener mi suscripción
              </Button>
              <Button variant="danger" onClick={handleCancel} disabled={cancelling} className="w-full sm:w-auto">
                {cancelling ? "Un momento..." : "Sí, cancelar"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-text">Planes de PeriodistaIA</h1>
        <p className="mt-1 text-sm text-brand-text/70">Elige el plan que mejor se adapte a tu trabajo.</p>
      </div>
      {noticeBox}

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
          {subscribeButton("Comenzar ahora →")}
          <p className="text-center text-xs text-brand-text/50">
            Pago mensual con PayPal. Se renueva solo y puedes cancelarlo cuando quieras.
          </p>
        </Card>
      </div>
    </div>
  );
}
