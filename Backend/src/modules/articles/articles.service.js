const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");
const { supabaseAdmin } = require("../../config/supabase");
const {
  NEWS_ARTICLE_SYSTEM_PROMPT,
  buildPressReleaseSystemPrompt,
  IDEA_NEWS_ARTICLE_SYSTEM_PROMPT,
  buildIdeaPressReleaseSystemPrompt,
} = require("./articles.prompts");

const ArticleSchema = z.object({
  title: z.string(),
  body: z.string(),
});

const PLAN_SECTIONS = [
  { key: "angle_suggestions", label: "Ángulos posibles" },
  { key: "key_questions", label: "Preguntas clave" },
  { key: "sources_to_check", label: "Fuentes a consultar" },
  { key: "investigation_steps", label: "Pasos de investigación" },
  { key: "potential_challenges", label: "Posibles obstáculos" },
];

function formatIdeaContent(ideaText, plan) {
  const sections = PLAN_SECTIONS.map(({ key, label }) => {
    const items = plan[key] || [];
    return `${label}:\n${items.map((item) => `- ${item}`).join("\n")}`;
  });

  return `Idea original:\n${ideaText}\n\n${sections.join("\n\n")}`;
}

async function generateArticle({ source, content, type, organizationName }) {
  let systemPrompt;

  if (source === "idea") {
    systemPrompt = type === "press_release" ? buildIdeaPressReleaseSystemPrompt(organizationName) : IDEA_NEWS_ARTICLE_SYSTEM_PROMPT;
  } else {
    systemPrompt = type === "press_release" ? buildPressReleaseSystemPrompt(organizationName) : NEWS_ARTICLE_SYSTEM_PROMPT;
  }

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

module.exports = { generateArticle, saveArticle, formatIdeaContent };
