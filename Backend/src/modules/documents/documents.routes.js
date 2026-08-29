const express = require("express");
const multer = require("multer");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");
const { ANALYSIS_TYPE_SLUGS, extractText, generateDocumentAnalysis, saveDocument } = require("./documents.service");

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

module.exports = router;
