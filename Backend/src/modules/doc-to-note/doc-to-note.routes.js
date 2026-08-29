const express = require("express");
const multer = require("multer");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");
const { extractText } = require("../documents/documents.service");
const { generateNoteFromDocument } = require("./doc-to-note.service");
const { saveArticle } = require("../articles/articles.service");
const { attachItemToProject } = require("../projects/projects.service");

const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
const FREE_PLAN_MAX_BYTES = 500 * 1024;
const FREE_PLAN_MAX_PAGES = 5;

const VALID_FORMATS = ["📰 Nota periodística", "📋 Comunicado de prensa"];
const SUPPORTED_FILE_TYPES = ["pdf", "docx", "txt"];
const MAX_FIELD_LENGTH = 200;
const MAX_PASTED_TEXT_LENGTH = 5000;

// La tabla `articles` restringe `type` a estos dos slugs (mismo check constraint
// que usa el módulo `articles`); el formulario maneja las etiquetas con emoji.
const ARTICLE_TYPE_BY_FORMAT = {
  "📰 Nota periodística": "news_article",
  "📋 Comunicado de prensa": "press_release",
};

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_DOCUMENT_BYTES } });
const router = express.Router();

router.post("/", requireCredits, upload.single("document"), async (req, res, next) => {
  try {
    const { format, tone, length, text: pastedText } = req.body;
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

    const article = await generateNoteFromDocument({ text, format, tone, length, organizationName });
    await incrementUsedCredits(req.credits);

    res.json({ title: article.title, body: article.body, format, tone });
  } catch (err) {
    next(err);
  }
});

router.post("/save", async (req, res, next) => {
  try {
    const { title, body, format, organization_name: organizationName, project_id: projectId } = req.body;

    if (typeof title !== "string" || typeof body !== "string" || !title.trim() || !body.trim()) {
      return res.status(400).json({ error: "Faltan 'title' y 'body'." });
    }
    if (typeof projectId !== "string" || !projectId) {
      return res.status(400).json({ error: "Falta 'project_id'." });
    }

    const saved = await saveArticle({
      userId: req.user.id,
      transcriptionId: null,
      type: ARTICLE_TYPE_BY_FORMAT[format] || "news_article",
      organizationName,
      article: { title, body },
      language: null,
    });

    const attached = await attachItemToProject({
      userId: req.user.id,
      projectId,
      type: "article",
      itemId: saved.id,
    });

    res.status(201).json(attached);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
