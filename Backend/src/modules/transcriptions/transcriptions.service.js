const { toFile } = require("openai");
const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const openai = require("../../config/openai");
const anthropic = require("../../config/anthropic");
const { supabaseAdmin } = require("../../config/supabase");

const INTERVIEW_ANALYSIS_SYSTEM_PROMPT = `Eres el copiloto editorial de PeriodistaIA. Un periodista te da la
transcripción de una entrevista (transcrita automáticamente por voz a texto, sin
marcas de quién habla en cada momento). Analízala y responde:
- participants: personas identificables en la conversación, cada una con {name, role}.
  Usa el nombre solo si aparece explícitamente en el texto (ej. alguien se presenta
  o es mencionado por nombre). Si no hay un nombre claro para alguien, usa un rol
  genérico como "Entrevistador" o "Entrevistado 1" en el campo "name" — NUNCA
  inventes un nombre propio que no esté en el texto.
- top_quotes: hasta 5 citas textuales, las más noticiosas de la entrevista, cada
  una con {quote, speaker, why_newsworthy}. "speaker" sigue la misma regla que
  arriba (nombre real si aparece, si no un rol genérico, nunca inventado).
  "why_newsworthy" explica en una frase por qué esa cita es relevante para una nota.
- main_topics: los temas principales discutidos, como lista de strings.
- suggested_angle: el ángulo periodístico más fuerte que sugiere el contenido de
  la entrevista, en una frase.
Responde siempre en el mismo idioma de la transcripción.`;

const InterviewAnalysisSchema = z.object({
  participants: z.array(z.object({ name: z.string(), role: z.string() })),
  top_quotes: z.array(
    z.object({
      quote: z.string(),
      speaker: z.string(),
      why_newsworthy: z.string(),
    })
  ),
  main_topics: z.array(z.string()),
  suggested_angle: z.string(),
});

async function getAudioDuration(buffer, mimeType) {
  const { parseBuffer } = await import("music-metadata");
  const metadata = await parseBuffer(buffer, mimeType, { duration: true }).catch(() => null);
  return metadata?.format?.duration ? Math.round(metadata.format.duration) : null;
}

async function transcribeAudio(buffer, filename) {
  const file = await toFile(buffer, filename);
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "verbose_json",
  });

  return { text: transcription.text, language: transcription.language, duration: transcription.duration };
}

async function saveTranscription({ userId, audioSource, audioUrl, durationSecs, fileSizeBytes, text, language }) {
  const { data, error } = await supabaseAdmin
    .from("transcriptions")
    .insert({
      user_id: userId,
      audio_source: audioSource,
      audio_url: audioUrl || null,
      audio_duration_secs: durationSecs,
      file_size_bytes: fileSizeBytes,
      transcript_text: text,
      language_detected: language,
      status: "done",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function analyzeInterview(transcriptText) {
  const response = await anthropic.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(InterviewAnalysisSchema),
    },
    system: INTERVIEW_ANALYSIS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: transcriptText }],
  });

  return response.parsed_output;
}

async function updateTranscriptionAnalysis({ transcriptionId, analysis }) {
  const { data, error } = await supabaseAdmin
    .from("transcriptions")
    .update({ interview_analysis: analysis })
    .eq("id", transcriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  getAudioDuration,
  transcribeAudio,
  saveTranscription,
  analyzeInterview,
  updateTranscriptionAnalysis,
};
