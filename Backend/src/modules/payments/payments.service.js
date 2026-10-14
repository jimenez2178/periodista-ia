const { supabaseAdmin } = require("../../config/supabase");
const resend = require("../../config/resend");
const env = require("../../config/env");
const { updateUserProfile } = require("../users/users.service");
const { upgradeCreditsToPro, downgradeToFree } = require("../credits/credits.service");
const { addDays } = require("../../utils/dateHelpers");
const paypal = require("./paypal.client");

async function verifyIpnWithPaypal(rawBody) {
  const response = await fetch(env.paypalIpnVerifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `cmd=_notify-validate&${rawBody}`,
  });

  const text = await response.text();
  return text.trim() === "VERIFIED";
}

function buildWelcomeEmailHtml({ fullName, isSubscription = false }) {
  const name = fullName || "periodista";
  const renewalNote = isSubscription
    ? "<p>Tu suscripción se renueva automáticamente cada mes. Puedes cancelarla cuando quieras desde la sección Planes.</p>"
    : "";

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a2e;">
      <h1>¡Bienvenido a PeriodistaIA Pro! 🎉</h1>
      <p>Hola ${name},</p>
      <p>Confirmamos tu pago de <strong>$12 USD</strong>. Tu cuenta ya tiene el plan Pro activo.</p>
      <p>Con Pro tienes:</p>
      <ul>
        <li>Consultas ilimitadas</li>
        <li>Audios sin límite de duración</li>
        <li>Análisis de documentos sin límite</li>
        <li>Historial completo</li>
        <li>Proyectos guardados</li>
      </ul>
      ${renewalNote}
      <p>
        <a
          href="https://periodista-ia.vercel.app"
          style="display: inline-block; background: #1e2a4a; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;"
        >
          Ir a PeriodistaIA
        </a>
      </p>
      <p>El equipo de PeriodistaIA</p>
    </div>
  `;
}

async function sendWelcomeEmail({ to, fullName, isSubscription = false }) {
  if (!resend) {
    console.warn("[payments] RESEND_API_KEY no configurada, se omite el email de bienvenida.");
    return;
  }

  await resend.emails.send({
    from: env.resendFromEmail || "noreply@periodista-ia.com",
    to,
    subject: "¡Bienvenido a PeriodistaIA Pro! 🎉",
    html: buildWelcomeEmailHtml({ fullName, isSubscription }),
  });
}

async function sendTelegramNotification({ fullName, email, amount, currency, txnId }) {
  await sendTelegramText(
    [
      "💰 Nuevo suscriptor Pro",
      `👤 Nombre: ${fullName || "(sin nombre)"}`,
      `📧 Email: ${email}`,
      `💵 Monto: $${amount} ${currency}`,
      `🕐 Fecha: ${new Date().toLocaleString("es")}`,
      `🆔 Transaction ID: ${txnId}`,
    ].join("\n"),
  );
}

async function sendTelegramText(text) {
  if (!env.telegramBotToken || !env.telegramChatId) {
    console.warn("[payments] Telegram no configurado (faltan TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID), se omite.");
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.telegramChatId, text }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Telegram respondió ${response.status}: ${body}`);
  }
}

async function upgradeUserToPro({ userId, fullName, email, amount, currency, txnId }) {
  const { error: paymentError } = await supabaseAdmin.from("payments").insert({
    user_id: userId,
    amount,
    currency,
    plan: "pro",
    payment_method: "paypal",
    external_payment_id: txnId,
    status: "completed",
  });

  if (paymentError) {
    if (paymentError.code === "23505") {
      console.warn(`[payments] IPN duplicado para txn_id=${txnId}, ya se había procesado. Se ignora.`);
      return;
    }
    throw paymentError;
  }

  try {
    await updateUserProfile(userId, {
      plan: "pro",
      plan_started_at: new Date().toISOString(),
      plan_expires_at: addDays(30),
    });
  } catch (err) {
    console.error("[payments] Error actualizando el plan del usuario:", err);
  }

  try {
    await upgradeCreditsToPro(userId);
  } catch (err) {
    console.error("[payments] Error actualizando créditos:", err);
  }

  try {
    await sendWelcomeEmail({ to: email, fullName });
  } catch (err) {
    console.error("[payments] Error enviando email de bienvenida:", err);
  }

  try {
    await sendTelegramNotification({ fullName, email, amount, currency, txnId });
  } catch (err) {
    console.error("[payments] Error enviando notificación de Telegram:", err);
  }
}

// ---------------------------------------------------------------------------
// Suscripcion mensual de PayPal
// ---------------------------------------------------------------------------

// Estados que guardamos en users.subscription_status.
const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  PAST_DUE: "past_due", // fallo un cobro; PayPal reintenta
  SUSPENDED: "suspended",
  CANCELLED: "cancelled", // sigue Pro hasta plan_expires_at
  EXPIRED: "expired",
  REFUNDED: "refunded",
};

const SUBSCRIPTION_ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function findUserById(userId) {
  if (!userId) return null;
  const { data, error } = await supabaseAdmin.from("users").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

function formatDate(isoDate) {
  return isoDate ? new Date(isoDate).toLocaleDateString("es", { timeZone: "UTC" }) : "(sin fecha)";
}

async function notifyAdmin(lines) {
  try {
    await sendTelegramText(lines.join("\n"));
  } catch (err) {
    console.error("[payments] Error enviando notificación de Telegram:", err);
  }
}

// Activa (o mantiene activa) una suscripcion que PayPal reporta como ACTIVE.
// Es idempotente: el aviso "activada", el primer cobro y la confirmacion al
// volver de PayPal pueden llegar en cualquier orden, y solo la primera vez que
// esta suscripcion se asigna al usuario se manda el email de bienvenida.
async function activateSubscription(subscription) {
  if (!SUBSCRIPTION_ID_PATTERN.test(subscription.id || "")) {
    console.warn(`[payments] Id de suscripción con formato inesperado (${subscription.id}). Se ignora.`);
    return null;
  }

  const user = await findUserById(subscription.custom_id);
  if (!user) {
    console.warn(`[payments] Suscripción ${subscription.id} con custom_id desconocido (${subscription.custom_id}). Se ignora.`);
    return null;
  }

  const nextBilling = subscription.billing_info?.next_billing_time || addDays(30);
  // Si ya tenia Pro con una fecha posterior (p. ej. pago unico anterior), la respetamos.
  const currentExpiry = user.plan === "pro" && user.plan_expires_at ? user.plan_expires_at : null;
  const expiresAt =
    currentExpiry && new Date(currentExpiry) > new Date(nextBilling) ? currentExpiry : new Date(nextBilling).toISOString();

  // Solo cambia la fila si esta suscripcion todavia no estaba asignada: eso
  // marca la "primera vez" de forma atomica aunque lleguen dos avisos juntos.
  const { data: newlyAssigned, error: assignError } = await supabaseAdmin
    .from("users")
    .update({
      paypal_subscription_id: subscription.id,
      subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
      plan: "pro",
      plan_started_at: new Date().toISOString(),
      plan_expires_at: expiresAt,
    })
    .eq("id", user.id)
    .or(`paypal_subscription_id.is.null,paypal_subscription_id.neq.${subscription.id}`)
    .select("id");

  if (assignError) throw assignError;
  const isNew = newlyAssigned.length > 0;

  if (!isNew) {
    const { error } = await supabaseAdmin
      .from("users")
      .update({ plan: "pro", subscription_status: SUBSCRIPTION_STATUS.ACTIVE, plan_expires_at: expiresAt })
      .eq("id", user.id)
      .eq("paypal_subscription_id", subscription.id);
    if (error) throw error;
  }

  await upgradeCreditsToPro(user.id);

  if (isNew) {
    try {
      await sendWelcomeEmail({ to: user.email, fullName: user.full_name, isSubscription: true });
    } catch (err) {
      console.error("[payments] Error enviando email de bienvenida:", err);
    }
    await notifyAdmin([
      "💰 Nueva suscripción Pro (mensual)",
      `👤 Nombre: ${user.full_name || "(sin nombre)"}`,
      `📧 Email: ${user.email}`,
      `📅 Próximo cobro: ${formatDate(nextBilling)}`,
      `🆔 Suscripción: ${subscription.id}`,
    ]);
  }

  return { user, isNew, expiresAt };
}

// Cambia el estado guardado de la suscripcion. Devuelve el usuario solo si el
// estado realmente cambio (un aviso repetido no notifica dos veces).
async function setSubscriptionStatus(subscription, status) {
  const user = await findUserById(subscription.custom_id);
  if (!user || user.paypal_subscription_id !== subscription.id) {
    console.warn(`[payments] Aviso de una suscripción que no es la actual del usuario (${subscription.id}). Se ignora.`);
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ subscription_status: status })
    .eq("id", user.id)
    .or(`subscription_status.is.null,subscription_status.neq.${status}`)
    .select("id");

  if (error) throw error;
  return data.length > 0 ? user : null;
}

async function handleSubscriptionStatusEvent(subscription, status) {
  const user = await setSubscriptionStatus(subscription, status);
  if (!user) return "sin cambios (aviso repetido o no es la suscripción actual)";

  if (status === SUBSCRIPTION_STATUS.EXPIRED) {
    await downgradeToFree(user.id, { subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED });
  }

  const titles = {
    [SUBSCRIPTION_STATUS.CANCELLED]: "🚫 Suscripción cancelada (sigue Pro hasta la fecha pagada)",
    [SUBSCRIPTION_STATUS.SUSPENDED]: "⏸️ Suscripción suspendida por PayPal",
    [SUBSCRIPTION_STATUS.PAST_DUE]: "⚠️ Falló un cobro de la suscripción (PayPal reintentará)",
    [SUBSCRIPTION_STATUS.EXPIRED]: "⌛ Suscripción terminada: el usuario pasó a Gratis",
  };

  await notifyAdmin([
    titles[status],
    `📧 Email: ${user.email}`,
    `📅 Pro hasta: ${status === SUBSCRIPTION_STATUS.EXPIRED ? "ya no" : formatDate(user.plan_expires_at)}`,
    `🆔 Suscripción: ${subscription.id}`,
  ]);

  return status === SUBSCRIPTION_STATUS.EXPIRED ? "estado → expired, pasó a Gratis" : `estado → ${status}`;
}

// Cobro mensual completado (incluye el primero).
async function handleSaleCompleted(sale) {
  const subscriptionId = sale.billing_agreement_id;
  if (!subscriptionId) {
    // Cobro que no es de una suscripcion (p. ej. el enlace de pago unico,
    // que se procesa por IPN en /api/payments/webhook).
    return "no es de una suscripción, ignorado";
  }

  // Le pedimos a PayPal la suscripcion: trae el custom_id (usuario) y la
  // fecha del proximo cobro, que es el nuevo vencimiento.
  const subscription = await paypal.getSubscription(subscriptionId);

  // Normalmente la suscripcion esta ACTIVE. Si no (p. ej. se cancelo justo
  // despues del cobro), el pago se registra igual pero no se toca el plan.
  const result =
    subscription.status === "ACTIVE"
      ? await activateSubscription(subscription)
      : { user: await findUserById(subscription.custom_id), expiresAt: null };
  if (!result?.user) return "usuario no encontrado, ignorado";

  const { error } = await supabaseAdmin.from("payments").insert({
    user_id: result.user.id,
    amount: sale.amount?.total,
    currency: sale.amount?.currency,
    plan: "pro",
    payment_method: "paypal",
    external_payment_id: sale.id,
    status: "completed",
  });

  if (error) {
    if (error.code === "23505") {
      console.warn(`[payments] Cobro ${sale.id} ya registrado. Se ignora el aviso repetido.`);
      return "cobro ya registrado (aviso repetido), ignorado";
    }
    throw error;
  }

  await notifyAdmin([
    "💵 Cobro de suscripción recibido",
    `📧 Email: ${result.user.email}`,
    `💵 Monto: $${sale.amount?.total} ${sale.amount?.currency}`,
    `📅 Pro hasta: ${formatDate(result.expiresAt || result.user.plan_expires_at)}`,
    `🆔 Cobro: ${sale.id}`,
  ]);

  return subscription.status === "ACTIVE" ? "cobro registrado, vencimiento actualizado" : "cobro registrado (suscripción no activa)";
}

// Reembolso o contracargo: Gratis al instante y se cancela la suscripcion
// en PayPal para que no vuelva a cobrar.
async function handleSaleReversed(saleId, kind) {
  const { data: payment, error } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("external_payment_id", saleId)
    .maybeSingle();

  if (error) throw error;
  if (!payment) {
    console.warn(`[payments] ${kind} de un cobro que no tenemos registrado (${saleId}). Se ignora.`);
    return "cobro no registrado, ignorado";
  }
  if (payment.status === kind) return "aviso repetido, ignorado";

  const { error: updateError } = await supabaseAdmin.from("payments").update({ status: kind }).eq("id", payment.id);
  if (updateError) throw updateError;

  const user = await findUserById(payment.user_id);
  if (!user) return `cobro marcado ${kind}; usuario no encontrado`;

  if (user.paypal_subscription_id) {
    try {
      await paypal.cancelSubscription(user.paypal_subscription_id, "Pago reembolsado o revertido");
    } catch (err) {
      console.error(`[payments] No se pudo cancelar en PayPal la suscripción ${user.paypal_subscription_id}:`, err);
    }
  }

  await downgradeToFree(user.id, {
    subscriptionStatus: user.paypal_subscription_id ? SUBSCRIPTION_STATUS.REFUNDED : undefined,
  });

  await notifyAdmin([
    kind === "refunded" ? "↩️ Pago reembolsado: el usuario pasó a Gratis" : "⚠️ Contracargo: el usuario pasó a Gratis",
    `📧 Email: ${user.email}`,
    `💵 Monto: $${payment.amount} ${payment.currency}`,
    `🆔 Cobro: ${saleId}`,
  ]);

  return user.paypal_subscription_id ? `cobro ${kind}: pasó a Gratis y se canceló la suscripción` : `cobro ${kind}: pasó a Gratis`;
}

// Procesa un aviso ya verificado. Devuelve { subscriptionId, result } para
// el registro del servidor (sin datos personales).
async function handlePaypalEvent(event) {
  const resource = event.resource || {};
  const subscriptionId =
    resource.billing_agreement_id || (event.event_type?.startsWith("BILLING.SUBSCRIPTION.") ? resource.id : null);

  let result;
  switch (event.event_type) {
    case "BILLING.SUBSCRIPTION.ACTIVATED": {
      const activated = await activateSubscription(resource);
      result = !activated
        ? "ignorado (datos no válidos o usuario desconocido)"
        : activated.isNew
          ? "activada (alta nueva)"
          : "ya estaba activa, sin repetir el alta";
      break;
    }
    case "PAYMENT.SALE.COMPLETED":
      result = await handleSaleCompleted(resource);
      break;
    case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
      result = await handleSubscriptionStatusEvent(resource, SUBSCRIPTION_STATUS.PAST_DUE);
      break;
    case "BILLING.SUBSCRIPTION.SUSPENDED":
      result = await handleSubscriptionStatusEvent(resource, SUBSCRIPTION_STATUS.SUSPENDED);
      break;
    case "BILLING.SUBSCRIPTION.CANCELLED":
      result = await handleSubscriptionStatusEvent(resource, SUBSCRIPTION_STATUS.CANCELLED);
      break;
    case "BILLING.SUBSCRIPTION.EXPIRED":
      result = await handleSubscriptionStatusEvent(resource, SUBSCRIPTION_STATUS.EXPIRED);
      break;
    case "PAYMENT.SALE.REFUNDED":
      result = await handleSaleReversed(resource.sale_id, "refunded");
      break;
    case "PAYMENT.SALE.REVERSED":
      result = await handleSaleReversed(resource.id, "reversed");
      break;
    default:
      result = "sin acción";
  }

  return { subscriptionId, result };
}

// --- Acciones del usuario (con sesion iniciada) ---

async function startSubscription(authUser) {
  if (!paypal.isPaypalConfigured()) {
    throw httpError(503, "Los pagos todavía no están configurados. Intenta más tarde.");
  }

  const user = await findUserById(authUser.id);
  const hasLiveSubscription =
    user?.paypal_subscription_id &&
    [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.PAST_DUE].includes(user.subscription_status);
  if (user?.plan === "pro" && hasLiveSubscription) {
    throw httpError(409, "Ya tienes una suscripción Pro activa.");
  }

  const { approveUrl } = await paypal.createSubscription({ userId: authUser.id, email: user?.email || authUser.email });
  return { approve_url: approveUrl };
}

// Al volver de PayPal, el navegador trae el id de la suscripcion. No lo damos
// por bueno: se lo preguntamos a PayPal y comprobamos que sea de este usuario.
async function confirmSubscription(authUser, subscriptionId) {
  if (!paypal.isPaypalConfigured()) {
    throw httpError(503, "Los pagos todavía no están configurados. Intenta más tarde.");
  }
  if (typeof subscriptionId !== "string" || !SUBSCRIPTION_ID_PATTERN.test(subscriptionId)) {
    throw httpError(400, "Falta el identificador de la suscripción.");
  }

  const subscription = await paypal.getSubscription(subscriptionId);
  if (subscription.custom_id !== authUser.id) {
    throw httpError(403, "Esta suscripción no pertenece a tu cuenta.");
  }

  if (subscription.status === "ACTIVE") {
    await activateSubscription(subscription);
    return { status: "active" };
  }
  if (subscription.status === "APPROVAL_PENDING" || subscription.status === "APPROVED") {
    return { status: "pending" };
  }
  return { status: subscription.status.toLowerCase() };
}

async function cancelUserSubscription(authUser) {
  if (!paypal.isPaypalConfigured()) {
    throw httpError(503, "Los pagos todavía no están configurados. Intenta más tarde.");
  }

  const user = await findUserById(authUser.id);
  const cancellable = [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.PAST_DUE, SUBSCRIPTION_STATUS.SUSPENDED];
  if (!user?.paypal_subscription_id || !cancellable.includes(user.subscription_status)) {
    throw httpError(400, "No tienes una suscripción activa para cancelar.");
  }

  await paypal.cancelSubscription(user.paypal_subscription_id, "Cancelada por el usuario desde PeriodistaIA");

  // PayPal tambien mandara el aviso "cancelada"; este cambio lo deja ya
  // reflejado y ese aviso no notificara dos veces.
  await handleSubscriptionStatusEvent(
    { id: user.paypal_subscription_id, custom_id: user.id },
    SUBSCRIPTION_STATUS.CANCELLED,
  );

  return { status: SUBSCRIPTION_STATUS.CANCELLED, plan_expires_at: user.plan_expires_at };
}

module.exports = {
  verifyIpnWithPaypal,
  upgradeUserToPro,
  handlePaypalEvent,
  startSubscription,
  confirmSubscription,
  cancelUserSubscription,
};
