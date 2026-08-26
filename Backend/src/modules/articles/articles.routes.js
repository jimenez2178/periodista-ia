const express = require("express");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");
const { generateArticle, saveArticle } = require("./articles.service");
const { supabaseAdmin } = require("../../config/supabase");

const router = express.Router();

const VALID_TYPES = ["news_article", "press_release"];

router.post("/", requireCredits, async (req, res, next) => {
  try {
    const { transcription_id, type, organization_name } = req.body;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: "El campo 'type' debe ser 'news_article' o 'press_release'." });
    }
    if (type === "press_release" && (typeof organization_name !== "string" || !organization_name.trim())) {
      return res.status(400).json({ error: "Falta el nombre de la organización para la nota de prensa." });
    }
    if (typeof transcription_id !== "string" || !transcription_id) {
      return res.status(400).json({ error: "Falta 'transcription_id'." });
    }

    const { data: transcription, error } = await supabaseAdmin
      .from("transcriptions")
      .select("transcript_text, language_detected, user_id")
      .eq("id", transcription_id)
      .single();

    if (error || !transcription || transcription.user_id !== req.user.id) {
      return res.status(404).json({ error: "No se encontró la transcripción." });
    }

    const article = await generateArticle({
      transcriptText: transcription.transcript_text,
      type,
      organizationName: organization_name,
    });

    await incrementUsedCredits(req.credits);

    const saved = await saveArticle({
      userId: req.user.id,
      transcriptionId: transcription_id,
      type,
      organizationName: organization_name,
      article,
      language: transcription.language_detected,
    });

    res.json(saved);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
