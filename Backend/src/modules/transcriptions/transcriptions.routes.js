const express = require("express");
const multer = require("multer");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");
const {
  getAudioDuration,
  transcribeAudio,
  saveTranscription,
  analyzeInterview,
  updateTranscriptionAnalysis,
} = require("./transcriptions.service");
const { downloadAudioFromUrl, MAX_AUDIO_BYTES } = require("../../utils/audioProcessor");
const { supabaseAdmin } = require("../../config/supabase");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_AUDIO_BYTES } });
const router = express.Router();

const FREE_PLAN_MAX_DURATION_SECS = 120;

const EXTENSION_BY_CONTENT_TYPE = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "video/mp4": "mp4",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
};

router.post("/", requireCredits, upload.single("audio"), async (req, res, next) => {
  try {
    let buffer;
    let mimeType;
    let filename;
    let audioSource;
    let audioUrl;

    if (req.file) {
      buffer = req.file.buffer;
      mimeType = req.file.mimetype;
      filename = req.file.originalname;
      audioSource = "upload";
      audioUrl = null;
    } else if (typeof req.body.url === "string" && req.body.url.trim()) {
      const downloaded = await downloadAudioFromUrl(req.body.url.trim());
      buffer = downloaded.buffer;
      mimeType = downloaded.contentType;
      filename = `audio-from-url.${EXTENSION_BY_CONTENT_TYPE[mimeType] || "mp3"}`;
      audioSource = "url";
      audioUrl = req.body.url.trim();
    } else {
      return res.status(400).json({ error: "Debes subir un archivo de audio o pegar un enlace." });
    }

    const durationSecs = await getAudioDuration(buffer, mimeType);

    if (req.credits.plan === "free" && durationSecs && durationSecs > FREE_PLAN_MAX_DURATION_SECS) {
      return res.status(402).json({
        error: `El plan gratuito permite audios de hasta ${FREE_PLAN_MAX_DURATION_SECS} segundos. Este audio dura ${durationSecs}s. Actualiza tu plan para transcribir audios más largos.`,
        code: "AUDIO_TOO_LONG",
      });
    }

    let text, language, duration;
    try {
      ({ text, language, duration } = await transcribeAudio(buffer, filename));
    } catch (transcribeError) {
      console.error("Error transcribiendo audio con Whisper:", transcribeError);
      return res.status(422).json({
        error:
          "No pudimos leer este archivo de audio. Puede estar dañado o incompleto (esto pasa seguido con audios exportados de WhatsApp). Intenta exportarlo de nuevo o prueba con otro archivo.",
        code: "AUDIO_UNREADABLE",
      });
    }

    await incrementUsedCredits(req.credits);

    const transcription = await saveTranscription({
      userId: req.user.id,
      audioSource,
      audioUrl,
      durationSecs: durationSecs ?? (duration ? Math.round(duration) : null),
      fileSizeBytes: buffer.length,
      text,
      language,
    });

    res.json({
      transcription_id: transcription.id,
      transcript: text,
      language,
      duration: transcription.audio_duration_secs,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/analyze", async (req, res, next) => {
  try {
    const { transcription_id } = req.body;

    if (typeof transcription_id !== "string" || !transcription_id) {
      return res.status(400).json({ error: "Falta 'transcription_id'." });
    }

    const { data: transcription, error } = await supabaseAdmin
      .from("transcriptions")
      .select("transcript_text, user_id")
      .eq("id", transcription_id)
      .single();

    if (error || !transcription || transcription.user_id !== req.user.id) {
      return res.status(404).json({ error: "No se encontró la transcripción." });
    }

    const analysis = await analyzeInterview(transcription.transcript_text);
    await updateTranscriptionAnalysis({ transcriptionId: transcription_id, analysis });

    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
