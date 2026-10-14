const express = require("express");
const requireAuth = require("../../middleware/auth");
const { isPaypalConfigured, verifyWebhookSignature } = require("./paypal.client");
const {
  handlePaypalEvent,
  startSubscription,
  confirmSubscription,
  cancelUserSubscription,
} = require("./payments.service");

const router = express.Router();

// Este router se monta en app.js ANTES del express.json() global: el receptor
// de avisos necesita el body crudo (rawBody) para verificar la firma con PayPal.
const jsonWithRawBody = express.json({
  limit: "1mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString("utf8");
  },
});

// Avisos de PayPal sobre la suscripcion (sin sesion: los manda PayPal).
// Respondemos 200 solo cuando el aviso quedo procesado; ante un error
// respondemos 500 y PayPal lo reintenta (el proceso es idempotente).
router.post("/paypal-events", jsonWithRawBody, async (req, res) => {
  if (!isPaypalConfigured()) {
    console.warn("[subscriptions] Aviso de PayPal recibido pero faltan las claves de PayPal en el .env.");
    return res.sendStatus(503);
  }

  let verified = false;
  try {
    verified = await verifyWebhookSignature(req.headers, req.rawBody || "");
  } catch (err) {
    console.error("[subscriptions] Error verificando la firma del aviso con PayPal:", err);
    return res.sendStatus(500);
  }

  if (!verified) {
    console.warn("[subscriptions] Aviso con firma no válida (no viene de PayPal). Se rechaza.");
    return res.sendStatus(400);
  }

  try {
    const { subscriptionId, result } = await handlePaypalEvent(req.body);
    // Solo tipo de aviso, numero de suscripcion y resultado: sin datos personales.
    console.log(
      `[subscriptions] Aviso procesado: ${req.body?.event_type} | suscripción ${subscriptionId || "-"} | ${result}`,
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(`[subscriptions] Error procesando el aviso ${req.body?.event_type} (${req.body?.id}):`, err);
    res.sendStatus(500);
  }
});

router.post("/start", requireAuth, async (req, res, next) => {
  try {
    res.json(await startSubscription(req.user));
  } catch (err) {
    next(err);
  }
});

router.post("/confirm", requireAuth, express.json(), async (req, res, next) => {
  try {
    res.json(await confirmSubscription(req.user, req.body?.subscription_id));
  } catch (err) {
    next(err);
  }
});

router.post("/cancel", requireAuth, async (req, res, next) => {
  try {
    res.json(await cancelUserSubscription(req.user));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
