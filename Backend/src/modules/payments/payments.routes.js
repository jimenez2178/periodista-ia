const express = require("express");
const { verifyIpnWithPaypal, upgradeUserToPro } = require("./payments.service");
const { getUserByEmail } = require("../users/users.service");

const router = express.Router();

// PayPal manda el IPN como form-urlencoded. Capturamos el body crudo (rawBody)
// porque la verificacion con PayPal exige reenviar el payload tal cual se
// recibio, precedido de "cmd=_notify-validate".
const paypalUrlencoded = express.urlencoded({
  extended: true,
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString("utf8");
  },
});

async function processIpn(body, rawBody) {
  const verified = await verifyIpnWithPaypal(rawBody);
  if (!verified) {
    console.warn("[payments] IPN no verificado por PayPal (posible intento inválido). Se ignora.");
    return;
  }

  if (body.payment_status !== "Completed") {
    console.log(`[payments] IPN con payment_status="${body.payment_status}", no requiere acción.`);
    return;
  }

  const payerEmail = body.payer_email;
  if (!payerEmail) {
    console.warn(`[payments] IPN completado sin payer_email (txn_id=${body.txn_id}).`);
    return;
  }

  const user = await getUserByEmail(payerEmail);
  if (!user) {
    console.warn(`[payments] No se encontró ningún usuario con email "${payerEmail}" (txn_id=${body.txn_id}).`);
    return;
  }

  const fullName = user.full_name || [body.first_name, body.last_name].filter(Boolean).join(" ");

  await upgradeUserToPro({
    userId: user.id,
    fullName,
    email: user.email,
    amount: body.mc_gross,
    currency: body.mc_currency,
    txnId: body.txn_id,
  });
}

router.post("/webhook", paypalUrlencoded, (req, res) => {
  // PayPal exige un 200 inmediato -- todo lo demas pasa despues, sin poder
  // afectar la respuesta ya enviada.
  res.sendStatus(200);

  processIpn(req.body, req.rawBody).catch((err) => {
    console.error("[payments] Error procesando IPN de PayPal:", err);
  });
});

module.exports = router;
