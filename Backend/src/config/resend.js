const { Resend } = require("resend");
const env = require("./env");

// Si falta la API key (ambiente sin Resend configurado todavia), exportamos
// null en vez de lanzar -- payments.service.js loguea y sigue sin enviar el
// email, no debe tumbar el resto del webhook.
module.exports = env.resendApiKey ? new Resend(env.resendApiKey) : null;
