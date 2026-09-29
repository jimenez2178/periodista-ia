const express = require("express");
const multer = require("multer");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");
const {
  ANALYSIS_TYPE_SLUGS,
  extractText,
  generateDocumentAnalysis,
  saveDocument,
  getDocumentAnalysis,
  getDocumentForNote,
} = require("./documents.service");
const { generateNoteFromDocument } = require("../doc-to-note/doc-to-note.service");
const { ARTICLE_TYPE_BY_FORMAT, VALID_FORMATS } = require("../doc-to-note/doc-to-note.prompts");
const { saveArticle } = require("../articles/articles.service");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_FIELD_LENGTH = 200;
const MAX_ANGLE_LENGTH = 1000;

const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
const FREE_PLAN_MAX_BYTES = 500 * 1024;
const FREE_PLAN_MAX_PAGES = 5;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_DOCUMENT_BYTES } });
const router = express.Router();

router.post("/", requireCredits, upload.single("document"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Debes subir un documento." });
    }

    let analysisTypes;
    try {
      analysisTypes = JSON.parse(req.body.analysis_types);
    } catch {
      analysisTypes = null;
    }

    if (
      !Array.isArray(analysisTypes) ||
      analysisTypes.length === 0 ||
      !analysisTypes.every((type) => ANALYSIS_TYPE_SLUGS.includes(type))
    ) {
      return res.status(400).json({ error: "Selecciona al menos un tipo de análisis válido." });
    }

    const { text, pageCount, fileType } = await extractText(req.file.buffer, req.file.originalname);

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "El documento no contiene texto legible." });
    }

    const isOverFreeLimit = req.file.size > FREE_PLAN_MAX_BYTES || (pageCount != null && pageCount > FREE_PLAN_MAX_PAGES);
    if (req.credits.plan === "free" && isOverFreeLimit) {
      return res.status(402).json({
        error:
          "El plan gratuito permite documentos de hasta 5 páginas o 500KB. Actualiza tu plan para analizar documentos más grandes.",
        code: "DOCUMENT_TOO_LARGE",
      });
    }

    const results = await generateDocumentAnalysis({ text, analysisTypes });
    await incrementUsedCredits(req.credits);

    const saved = await saveDocument({
      userId: req.user.id,
      fileName: req.file.originalname,
      fileType,
      fileSizeBytes: req.file.size,
      analysisTypes,
      results,
      extractedText: text,
    });

    res.json({
      id: saved.id,
      file_name: saved.file_name,
      file_type: saved.file_type,
      analysis_types: saved.analysis_types,
      results: saved.results,
      created_at: saved.created_at,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!UUID_PATTERN.test(req.params.id)) {
      return res.status(404).json({ error: "No se encontró el documento." });
    }
    const document = await getDocumentAnalysis({ userId: req.user.id, documentId: req.params.id });
    if (!document) {
      return res.status(404).json({ error: "No se encontró el documento." });
    }
    res.json(document);
  } catch (err) {
    next(err);
  }
});

// Redacta una nota a partir de un documento ya analizado, opcionalmente enfocada
// en una de las historias que sugirió el análisis.
router.post("/:id/note", requireCredits, async (req, res, next) => {
  try {
    const { format, tone, length, angle } = req.body;
    const organizationName = req.body.organization_name;

    if (!UUID_PATTERN.test(req.params.id)) {
      return res.status(404).json({ error: "No se encontró el documento." });
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
      return res.status(400).json({ error: "La historia a desarrollar no es válida." });
    }

    const document = await getDocumentForNote({ userId: req.user.id, documentId: req.params.id });
    if (!document) {
      return res.status(404).json({ error: "No se encontró el documento." });
    }
    if (!document.extracted_text) {
      return res.status(409).json({
        error: "Este análisis es anterior a esta función y no guardó el texto del documento. Vuelve a analizarlo.",
        code: "DOCUMENT_TEXT_UNAVAILABLE",
      });
    }

    const article = await generateNoteFromDocument({
      text: document.extracted_text,
      format,
      tone,
      length,
      organizationName,
      angle: (angle || "").trim(),
    });
    await incrementUsedCredits(req.credits);

    const saved = await saveArticle({
      userId: req.user.id,
      type: ARTICLE_TYPE_BY_FORMAT[format],
      organizationName,
      article,
      language: null,
    });

    res.json(saved);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
