const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");
const { supabaseAdmin } = require("../../config/supabase");
const {
  NEWS_ARTICLE_SYSTEM_PROMPT,
  buildPressReleaseSystemPrompt,
} = require("./articles.prompts");

const ArticleSchema = z.object({
  title: z.string(),
  body: z.string(),
});

function formatTranscriptionContent({ transcript, context, angle, quotes }) {
  const parts = [];

  if (context) parts.push(`Contexto del periodista:\n${context}`);
  if (angle) parts.push(`Ángulo elegido:\n${angle}`);
  if (quotes.length > 0) {
    const lines = quotes.map(({ quote, speaker }) => `- "${quote}"${speaker ? ` — ${speaker}` : ""}`);
    parts.push(`Citas elegidas:\n${lines.join("\n")}`);
  }

  // Sin indicaciones, la IA recibe la transcripción sola, igual que antes.
  if (parts.length === 0) return transcript;
  return `${parts.join("\n\n")}\n\nTranscripción:\n${transcript}`;
}

async function generateArticle({ content, type, organizationName }) {
  const systemPrompt = type === "press_release" ? buildPressReleaseSystemPrompt(organizationName) : NEWS_ARTICLE_SYSTEM_PROMPT;

  const response = await anthropic.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(ArticleSchema),
    },
    system: systemPrompt,
    messages: [{ role: "user", content }],
  });

  return response.parsed_output;
}

async function saveArticle({ userId, transcriptionId, sessionId, type, organizationName, article, language }) {
  const wordCount = article.body.trim().split(/\s+/).filter(Boolean).length;

  const { data, error } = await supabaseAdmin
    .from("articles")
    .insert({
      user_id: userId,
      transcription_id: transcriptionId || null,
      session_id: sessionId || null,
      type,
      organization_name: organizationName || null,
      title: article.title,
      body: article.body,
      language: language || null,
      word_count: wordCount,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateArticle({ userId, articleId, title, body }) {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  const { data, error } = await supabaseAdmin
    .from("articles")
    .update({ title, body, word_count: wordCount, updated_at: new Date().toISOString() })
    .eq("id", articleId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

module.exports = { generateArticle, saveArticle, updateArticle, formatTranscriptionContent };
