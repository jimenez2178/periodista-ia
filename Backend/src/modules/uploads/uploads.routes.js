const express = require("express");
const cors = require("cors");
const env = require("../../config/env");
const {
  UPLOAD_ACTIONS,
  isUploadTicketConfigured,
  issueUploadTicket,
  consumeUploadTicket,
} = require("./uploadTicket");
const docToNoteRoutes = require("../doc-to-note/doc-to-note.routes");
const documentsRoutes = require("../documents/documents.routes");
const transcriptionsRoutes = require("../transcriptions/transcriptions.routes");

// ---------- Pase de subida (llega por el proxy de Vercel, con sesion) ----------

const ticketRouter = express.Router();

ticketRouter.post("/ticket", (req, res) => {
  const action = req.body?.action;
  if (!UPLOAD_ACTIONS.includes(action)) {
    return res.status(400).json({ error: "Acción de subida no válida." });
  }
  // Sin clave configurada el frontend sigue subiendo por el proxy de siempre.
  if (!isUploadTicketConfigured()) {
    return res.status(503).json({ error: "La subida directa no está configurada.", code: "DIRECT_UPLOAD_DISABLED" });
  }

  const { ticket, expiresIn } = issueUploadTicket(req.user.id, action);
  res.json({ ticket, expires_in: expiresIn, upload_url: `${env.publicApiUrl}/api/direct/${action}` });
});

// ---------- Subida directa (navegador -> backend, sin pasar por Vercel) ----------

// Solo la web de PeriodistaIA (y localhost fuera de produccion) puede subir
// directo. Este CORS aplica unicamente a /api/direct; el resto del backend no cambia.
// En produccion se descarta cualquier localhost, aunque APP_URL lo traiga por error.
const isLocalhost = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const allowedOrigins =
  env.nodeEnv === "production"
    ? [env.appUrl].filter((origin) => !isLocalhost(origin))
    : [env.appUrl, "http://localhost:3000"];

const directUploadCors = cors({
  origin: allowedOrigins,
  methods: ["POST"],
  allowedHeaders: ["Content-Type", "X-Upload-Ticket"],
  maxAge: 600,
});

// El CORS solo lo hace cumplir el navegador; aqui tambien se corta del lado del servidor.
function rejectForeignOrigin(req, res, next) {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Origen no permitido." });
  }
  next();
}

// Cada router de subida tambien tiene rutas de lectura; por aqui solo pasa el POST de subida.
function onlyUploadPost(req, res, next) {
  if (req.method === "POST" && req.path === "/") return next();
  res.status(404).json({ error: "No encontrado." });
}

function requireUploadTicket(action) {
  return (req, res, next) => {
    const result = consumeUploadTicket(req.headers["x-upload-ticket"], action);
    if (result.error) return res.status(401).json({ error: result.error, code: "UPLOAD_TICKET_INVALID" });
    // Las rutas de subida solo usan el id del usuario.
    req.user = { id: result.userId };
    next();
  };
}

const directRouter = express.Router();
directRouter.use(directUploadCors, rejectForeignOrigin);
directRouter.use("/doc-to-note", onlyUploadPost, requireUploadTicket("doc-to-note"), docToNoteRoutes);
directRouter.use("/documents", onlyUploadPost, requireUploadTicket("documents"), documentsRoutes);
directRouter.use("/transcriptions", onlyUploadPost, requireUploadTicket("transcriptions"), transcriptionsRoutes);

module.exports = { ticketRouter, directRouter };
