const express = require("express");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");
const { generateArticle, saveArticle, formatIdeaContent } = require("./articles.service");
const { supabaseAdmin } = require("../../config/supabase");

const router = express.Router();

const VALID_TYPES = ["news_article", "press_release"];

router.post("/", requireCredits, async (req, res, next) => {
  try {
    const { transcription_id, idea_text, plan, session_id, type, organization_name } = req.body;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: "El campo 'type' debe ser 'news_article' o 'press_release'." });
    }
    if (type === "press_release" && (typeof organization_name !== "string" || !organization_name.trim())) {
      return res.status(400).json({ error: "Falta el nombre de la organización para la nota de prensa." });
    }

    if (transcription_id && idea_text) {
      return res.status(400).json({ error: "Envía solo 'transcription_id' o 'idea_text', no ambos." });
    }
    if (!transcription_id && !idea_text) {
      return res.status(400).json({ error: "Falta 'transcription_id' o 'idea_text'." });
    }

    let content;
    let source;
    let transcriptionIdToSave = null;
    let sessionIdToSave = null;
    let language = null;

    if (transcription_id) {
      const { data: transcription, error } = await supabaseAdmin
        .from("transcriptions")
        .select("transcript_text, language_detected, user_id")
        .eq("id", transcription_id)
        .single();

      if (error || !transcription || transcription.user_id !== req.user.id) {
        return res.status(404).json({ error: "No se encontró la transcripción." });
      }

      content = transcription.transcript_text;
      source = "transcription";
      transcriptionIdToSave = transcription_id;
      language = transcription.language_detected;
    } else {
      if (typeof idea_text !== "string" || !idea_text.trim()) {
        return res.status(400).json({ error: "Falta 'idea_text'." });
      }
      if (!plan || typeof plan !== "object") {
        return res.status(400).json({ error: "Falta 'plan'." });
      }

      content = formatIdeaContent(idea_text.trim(), plan);
      source = "idea";
      sessionIdToSave = session_id || null;
    }

    const article = await generateArticle({
      source,
      content,
      type,
      organizationName: organization_name,
    });

    await incrementUsedCredits(req.credits);

    const saved = await saveArticle({
      userId: req.user.id,
      transcriptionId: transcriptionIdToSave,
      sessionId: sessionIdToSave,
      type,
      organizationName: organization_name,
      article,
      language,
    });

    res.json(saved);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
