const express = require("express");
const multer = require("multer");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");
const { extractText } = require("../documents/documents.service");
const { generateNoteFromDocument } = require("./doc-to-note.service");
const { ARTICLE_TYPE_BY_FORMAT, VALID_FORMATS } = require("./doc-to-note.prompts");
const { saveArticle } = require("../articles/articles.service");

const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
const FREE_PLAN_MAX_BYTES = 500 * 1024;
const FREE_PLAN_MAX_PAGES = 5;

const SUPPORTED_FILE_TYPES = ["pdf", "docx", "txt"];
const MAX_FIELD_LENGTH = 200;
const MAX_ANGLE_LENGTH = 1000;
const MAX_PASTED_TEXT_LENGTH = 5000;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_DOCUMENT_BYTES } });
const router = express.Router();

router.post("/", requireCredits, upload.single("document"), async (req, res, next) => {
  try {
    const { format, tone, length, angle, text: pastedText } = req.body;
    const organizationName = req.body.organization_name;

    if (req.file && pastedText) {
      return res.status(400).json({ error: "Envía solo un documento o un texto, no ambos." });
    }
    if (!req.file && !pastedText) {
      return res.status(400).json({ error: "Debes subir un documento o pegar un texto." });
    }

    if (!VALID_FORMATS.includes(format)) {
      return res.status(400).json({ error: "Selecciona un formato de salida válido." });
    }

    if (format === "📋 Comunicado de prensa" && (typeof organizationName !== "string" || !organizationName.trim())) {
      return res.status(400).json({ error: "Falta el nombre de la organización para el comunicado de prensa." });
    }

    if (typeof tone !== "string" || !tone.trim() || tone.length > MAX_FIELD_LENGTH) {
      return res.status(400).json({ error: "Selecciona un tono válido." });
    }

    if (typeof length !== "string" || !length.trim() || length.length > MAX_FIELD_LENGTH) {
      return res.status(400).json({ error: "Selecciona una extensión válida." });
    }

    if (angle != null && (typeof angle !== "string" || angle.length > MAX_ANGLE_LENGTH)) {
      return res.status(400).json({ error: `El enfoque no puede superar ${MAX_ANGLE_LENGTH} caracteres.` });
    }

    let text;

    if (req.file) {
      let pageCount, fileType;
      ({ text, pageCount, fileType } = await extractText(req.file.buffer, req.file.originalname));

      if (!SUPPORTED_FILE_TYPES.includes(fileType)) {
        return res.status(400).json({ error: "Formato no compatible. Sube un PDF, Word (.docx) o TXT." });
      }

      if (!text || !text.trim()) {
        return res.status(400).json({ error: "El documento no contiene texto legible." });
      }

      const isOverFreeLimit = req.file.size > FREE_PLAN_MAX_BYTES || (pageCount != null && pageCount > FREE_PLAN_MAX_PAGES);
      if (req.credits.plan === "free" && isOverFreeLimit) {
        return res.status(402).json({
          error: "El plan gratuito permite documentos de hasta 5 páginas o 500KB. Actualiza tu plan para documentos más grandes.",
          code: "DOCUMENT_TOO_LARGE",
        });
      }
    } else {
      if (typeof pastedText !== "string" || !pastedText.trim()) {
        return res.status(400).json({ error: "El texto no puede estar vacío." });
      }
      if (pastedText.length > MAX_PASTED_TEXT_LENGTH) {
        return res.status(400).json({ error: `El texto no puede superar ${MAX_PASTED_TEXT_LENGTH} caracteres.` });
      }
      text = pastedText.trim();
    }

    const article = await generateNoteFromDocument({
      text,
      format,
      tone,
      length,
      organizationName,
      angle: (angle || "").trim(),
    });
    await incrementUsedCredits(req.credits);

    // Se guarda al generarse (como en las demás funciones): así aparece en el
    // historial, las ediciones se autoguardan y "Guardar en proyecto" solo la vincula.
    const saved = await saveArticle({
      userId: req.user.id,
      type: ARTICLE_TYPE_BY_FORMAT[format],
      organizationName,
      article,
      language: null,
    });

    res.json({ ...saved, format, tone });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
