const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");
const { supabaseAdmin } = require("../../config/supabase");
const { NEWS_ARTICLE_SYSTEM_PROMPT, buildPressReleaseSystemPrompt } = require("./articles.prompts");

const ArticleSchema = z.object({
  title: z.string(),
  body: z.string(),
});

async function generateArticle({ transcriptText, type, organizationName }) {
  const systemPrompt =
    type === "press_release" ? buildPressReleaseSystemPrompt(organizationName) : NEWS_ARTICLE_SYSTEM_PROMPT;

  const response = await anthropic.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(ArticleSchema),
    },
    system: systemPrompt,
    messages: [{ role: "user", content: transcriptText }],
  });

  return response.parsed_output;
}

async function saveArticle({ userId, transcriptionId, type, organizationName, article, language }) {
  const wordCount = article.body.trim().split(/\s+/).filter(Boolean).length;

  const { data, error } = await supabaseAdmin
    .from("articles")
    .insert({
      user_id: userId,
      transcription_id: transcriptionId || null,
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

module.exports = { generateArticle, saveArticle };
