const { toFile } = require("openai");
const openai = require("../../config/openai");
const { supabaseAdmin } = require("../../config/supabase");

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

module.exports = { getAudioDuration, transcribeAudio, saveTranscription };
