const crypto = require("crypto");
const env = require("../../config/env");

// Pase de subida: permite que el navegador mande un archivo grande directo al
// backend (Vercel no deja pasar mas de 4,5 MB) sin exponer la sesion, que sigue
// en la cookie httpOnly del frontend. El pase:
//  - dura 5 minutos,
//  - es de un solo uso (se anota al usarlo y no se acepta otra vez),
//  - va atado a un usuario y a una accion de subida concreta,
//  - va firmado con UPLOAD_TICKET_SECRET (HMAC-SHA256).
const TICKET_TTL_SECONDS = 5 * 60;
const UPLOAD_ACTIONS = ["doc-to-note", "documents", "transcriptions"];
const MIN_SECRET_LENGTH = 32;

// Pases ya usados (id -> vencimiento en ms). Basta con memoria: el backend
// corre en un solo proceso y, si se reinicia, los pases viejos vencen solos.
const usedTicketIds = new Map();

function isUploadTicketConfigured() {
  return typeof env.uploadTicketSecret === "string" && env.uploadTicketSecret.length >= MIN_SECRET_LENGTH;
}

function sign(payloadPart) {
  return crypto.createHmac("sha256", env.uploadTicketSecret).update(payloadPart).digest("base64url");
}

function issueUploadTicket(userId, action) {
  const payload = {
    sub: userId,
    act: action,
    jti: crypto.randomUUID(),
    exp: Math.floor(Date.now() / 1000) + TICKET_TTL_SECONDS,
  };
  const payloadPart = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { ticket: `${payloadPart}.${sign(payloadPart)}`, expiresIn: TICKET_TTL_SECONDS };
}

function forgetExpiredTickets(nowMs) {
  for (const [id, expiresAtMs] of usedTicketIds) {
    if (expiresAtMs <= nowMs) usedTicketIds.delete(id);
  }
}

// Devuelve { userId } si el pase es valido para esa accion, o { error } con el
// motivo. Un pase valido queda gastado en esta misma llamada.
function consumeUploadTicket(ticket, action) {
  if (!isUploadTicketConfigured()) return { error: "La subida directa no está configurada." };
  if (typeof ticket !== "string" || !ticket.includes(".")) return { error: "Falta el pase de subida." };

  const [payloadPart, signature] = ticket.split(".");
  const expected = sign(payloadPart);
  const given = Buffer.from(signature || "");
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, Buffer.from(expected))) {
    return { error: "Pase de subida inválido." };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
  } catch {
    return { error: "Pase de subida inválido." };
  }

  const nowMs = Date.now();
  forgetExpiredTickets(nowMs);

  if (!payload.sub || !payload.jti || !payload.exp) return { error: "Pase de subida inválido." };
  if (payload.exp * 1000 <= nowMs) return { error: "El pase de subida venció. Intenta subir el archivo de nuevo." };
  if (payload.act !== action) return { error: "Este pase no sirve para esta subida." };
  if (usedTicketIds.has(payload.jti)) return { error: "Este pase de subida ya se usó." };

  usedTicketIds.set(payload.jti, payload.exp * 1000);
  return { userId: payload.sub };
}

module.exports = {
  UPLOAD_ACTIONS,
  isUploadTicketConfigured,
  issueUploadTicket,
  consumeUploadTicket,
};
