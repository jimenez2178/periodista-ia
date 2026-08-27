const { supabaseAdmin } = require("../../config/supabase");
const resend = require("../../config/resend");
const env = require("../../config/env");
const { updateUserProfile } = require("../users/users.service");
const { upgradeCreditsToPro } = require("../credits/credits.service");
const { addDays } = require("../../utils/dateHelpers");

async function verifyIpnWithPaypal(rawBody) {
  const response = await fetch(env.paypalIpnVerifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `cmd=_notify-validate&${rawBody}`,
  });

  const text = await response.text();
  return text.trim() === "VERIFIED";
}

function buildWelcomeEmailHtml({ fullName }) {
  const name = fullName || "periodista";

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

async function sendWelcomeEmail({ to, fullName }) {
  if (!resend) {
    console.warn("[payments] RESEND_API_KEY no configurada, se omite el email de bienvenida.");
    return;
  }

  await resend.emails.send({
    from: env.resendFromEmail || "noreply@periodista-ia.com",
    to,
    subject: "¡Bienvenido a PeriodistaIA Pro! 🎉",
    html: buildWelcomeEmailHtml({ fullName }),
  });
}

async function sendTelegramNotification({ fullName, email, amount, currency, txnId }) {
  if (!env.telegramBotToken || !env.telegramChatId) {
    console.warn("[payments] Telegram no configurado (faltan TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID), se omite.");
    return;
  }

  const text = [
    "💰 Nuevo suscriptor Pro",
    `👤 Nombre: ${fullName || "(sin nombre)"}`,
    `📧 Email: ${email}`,
    `💵 Monto: $${amount} ${currency}`,
    `🕐 Fecha: ${new Date().toLocaleString("es")}`,
    `🆔 Transaction ID: ${txnId}`,
  ].join("\n");

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

module.exports = { verifyIpnWithPaypal, upgradeUserToPro };
