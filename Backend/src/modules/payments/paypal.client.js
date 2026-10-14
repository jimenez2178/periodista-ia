const env = require("../../config/env");

const API_BASE = env.paypalMode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

function isPaypalConfigured() {
  return Boolean(env.paypalClientId && env.paypalClientSecret && env.paypalPlanId && env.paypalWebhookId);
}

// El token de acceso dura ~9 horas; lo reutilizamos hasta 1 minuto antes de que venza.
let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) return cachedToken;

  const credentials = Buffer.from(`${env.paypalClientId}:${env.paypalClientSecret}`).toString("base64");
  const response = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal rechazó las credenciales (HTTP ${response.status}).`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  cachedTokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function paypalRequest(method, path, { body, rawBody } = {}) {
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: rawBody ?? (body ? JSON.stringify(body) : undefined),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const err = new Error(`PayPal respondió ${response.status} en ${method} ${path}: ${data?.message || text}`);
    err.paypalStatus = response.status;
    err.paypalIssue = data?.details?.[0]?.issue;
    throw err;
  }

  return data;
}

// custom_id lleva el id del usuario de PeriodistaIA: PayPal lo devuelve en
// cada aviso, asi la suscripcion queda atada a la cuenta y no al email de PayPal.
async function createSubscription({ userId, email }) {
  const subscription = await paypalRequest("POST", "/v1/billing/subscriptions", {
    body: {
      plan_id: env.paypalPlanId,
      custom_id: userId,
      subscriber: email ? { email_address: email } : undefined,
      application_context: {
        brand_name: "PeriodistaIA",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${env.appUrl}/billing?suscripcion=volver`,
        cancel_url: `${env.appUrl}/billing?suscripcion=abandonada`,
      },
    },
  });

  const approveLink = subscription.links?.find((link) => link.rel === "approve")?.href;
  if (!approveLink) {
    throw new Error("PayPal no devolvió el enlace para aprobar la suscripción.");
  }

  return { subscriptionId: subscription.id, approveUrl: approveLink };
}

async function getSubscription(subscriptionId) {
  return paypalRequest("GET", `/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

async function cancelSubscription(subscriptionId, reason) {
  try {
    await paypalRequest("POST", `/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
      body: { reason: reason.slice(0, 127) },
    });
  } catch (err) {
    // Ya estaba cancelada o expirada: para nosotros es el mismo resultado.
    if (err.paypalIssue === "SUBSCRIPTION_STATUS_INVALID") return;
    throw err;
  }
}

// Le preguntamos a PayPal si el aviso es autentico. El evento se reenvia con
// el texto crudo tal cual llego: re-serializar el JSON puede cambiar el
// formato y hacer fallar la verificacion.
async function verifyWebhookSignature(headers, rawBody) {
  const signatureHeaders = [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ];
  // Sin las cabeceras de firma no puede venir de PayPal: se rechaza sin consultar.
  if (!rawBody || signatureHeaders.some((name) => !headers[name])) return false;

  const head = JSON.stringify({
    auth_algo: headers["paypal-auth-algo"],
    cert_url: headers["paypal-cert-url"],
    transmission_id: headers["paypal-transmission-id"],
    transmission_sig: headers["paypal-transmission-sig"],
    transmission_time: headers["paypal-transmission-time"],
    webhook_id: env.paypalWebhookId,
  });

  try {
    const data = await paypalRequest("POST", "/v1/notifications/verify-webhook-signature", {
      rawBody: `${head.slice(0, -1)},"webhook_event":${rawBody}}`,
    });
    return data?.verification_status === "SUCCESS";
  } catch (err) {
    // 400 = PayPal considera el aviso mal formado: no es valido. Cualquier
    // otro error (PayPal caido, red) se propaga para responder 500 y que
    // PayPal reintente el aviso real.
    if (err.paypalStatus === 400) return false;
    throw err;
  }
}

module.exports = {
  isPaypalConfigured,
  createSubscription,
  getSubscription,
  cancelSubscription,
  verifyWebhookSignature,
};
