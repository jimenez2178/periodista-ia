const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");
const { buildSystemPrompt } = require("./doc-to-note.prompts");

const ArticleSchema = z.object({
  title: z.string(),
  body: z.string(),
});

async function generateNoteFromDocument({ text, format, tone, length, organizationName }) {
  const response = await anthropic.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(ArticleSchema),
    },
    system: buildSystemPrompt({ format, tone, length, organizationName }),
    messages: [{ role: "user", content: text }],
  });

  return response.parsed_output;
}

module.exports = { generateNoteFromDocument };
