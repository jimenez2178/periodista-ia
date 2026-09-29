const express = require("express");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");
const {
  generateArticle,
  saveArticle,
  updateArticle,
  formatIdeaContent,
  formatTranscriptionContent,
} = require("./articles.service");
const { supabaseAdmin } = require("../../config/supabase");

const router = express.Router();

const VALID_TYPES = ["news_article", "press_release"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_CONTEXT_LENGTH = 2000;
const MAX_ANGLE_LENGTH = 500;
const MAX_QUOTES = 10;
const MAX_QUOTE_LENGTH = 1000;

// Indicaciones opcionales del periodista para una nota desde transcripción.
function parseTranscriptionGuidance({ context, angle, quotes }) {
  if (context != null && typeof context !== "string") return { error: "'context' debe ser texto." };
  if (angle != null && typeof angle !== "string") return { error: "'angle' debe ser texto." };
  if (quotes != null && !Array.isArray(quotes)) return { error: "'quotes' debe ser una lista." };

  const cleanContext = (context || "").trim();
  const cleanAngle = (angle || "").trim();
  if (cleanContext.length > MAX_CONTEXT_LENGTH) {
    return { error: `El contexto no puede superar ${MAX_CONTEXT_LENGTH} caracteres.` };
  }
  if (cleanAngle.length > MAX_ANGLE_LENGTH) {
    return { error: `El ángulo no puede superar ${MAX_ANGLE_LENGTH} caracteres.` };
  }

  const cleanQuotes = (quotes || [])
    .filter((item) => item && typeof item.quote === "string" && item.quote.trim())
    .map((item) => ({
      quote: item.quote.trim().slice(0, MAX_QUOTE_LENGTH),
      speaker: typeof item.speaker === "string" ? item.speaker.trim().slice(0, 200) : "",
    }));
  if (cleanQuotes.length > MAX_QUOTES) {
    return { error: `Puedes elegir hasta ${MAX_QUOTES} citas.` };
  }

  return { context: cleanContext, angle: cleanAngle, quotes: cleanQuotes };
}

router.post("/", requireCredits, async (req, res, next) => {
  try {
    const { transcription_id, idea_text, plan, session_id, type, organization_name, context, angle, quotes } =
      req.body;

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

      const guidance = parseTranscriptionGuidance({ context, angle, quotes });
      if (guidance.error) {
        return res.status(400).json({ error: guidance.error });
      }

      content = formatTranscriptionContent({ transcript: transcription.transcript_text, ...guidance });
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

router.patch("/:id", async (req, res, next) => {
  try {
    const { title, body } = req.body;

    if (typeof title !== "string" || typeof body !== "string" || !title.trim() || !body.trim()) {
      return res.status(400).json({ error: "El título y el cuerpo de la nota no pueden estar vacíos." });
    }

    if (!UUID_PATTERN.test(req.params.id)) {
      return res.status(404).json({ error: "No se encontró la nota." });
    }

    const updated = await updateArticle({ userId: req.user.id, articleId: req.params.id, title, body });

    if (!updated) {
      return res.status(404).json({ error: "No se encontró la nota." });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
