require("dotenv").config();

const required = [
  "ANTHROPIC_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Faltan variables de entorno requeridas: ${missing.join(", ")}`);
}

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000/reset-password",
  // Pagos (PayPal + Resend + notificacion de Telegram al admin). Opcionales:
  // si faltan, payments.service.js loguea y sigue sin romper nada.
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL,
  paypalIpnVerifyUrl: process.env.PAYPAL_IPN_VERIFY_URL || "https://ipnpb.paypal.com/cgi-bin/webscr",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  // Suscripcion mensual de PayPal (API REST + avisos/webhooks). Por defecto
  // "sandbox": solo con PAYPAL_MODE=live se cobra dinero real. Si faltan las
  // claves, las rutas de suscripcion responden "no configurado" sin romper nada.
  paypalMode: process.env.PAYPAL_MODE === "live" ? "live" : "sandbox",
  paypalClientId: process.env.PAYPAL_CLIENT_ID,
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  paypalPlanId: process.env.PAYPAL_PLAN_ID,
  paypalWebhookId: process.env.PAYPAL_WEBHOOK_ID,
  // A donde vuelve el usuario despues de aprobar (o abandonar) en PayPal.
  // Tambien es el unico origen autorizado para la subida directa de archivos.
  appUrl: (process.env.APP_URL || "https://www.periodista-ia-app.com").replace(/\/$/, ""),
  // Subida directa de archivos (navegador -> backend, sin el limite de 4,5 MB
  // de Vercel). Sin UPLOAD_TICKET_SECRET el frontend sigue subiendo por el proxy.
  uploadTicketSecret: process.env.UPLOAD_TICKET_SECRET,
  publicApiUrl: (
    process.env.PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://api.periodista-ia-app.com"
      : `http://localhost:${process.env.PORT || 3001}`)
  ).replace(/\/$/, ""),
};
