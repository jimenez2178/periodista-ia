const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");

const CONTENT_TYPE_LABELS = {
  article: "una nota periodística",
  document_analysis: "un análisis de documento periodístico",
};

const PLATFORM_GUIDANCE = {
  instagram:
    "Escribe un copy para Instagram: texto emotivo de 150 a 200 caracteres, con 3 a 5 emojis relevantes, seguido de 5 hashtags sugeridos en líneas aparte.",
  twitter:
    "Escribe un hilo para X/Twitter de 3 a 5 tweets, cada uno de máximo 280 caracteres, numerados como '1/5', '2/5', etc. Separa cada tweet con una línea en blanco.",
  linkedin:
    "Escribe un copy para LinkedIn en tono profesional, de 200 a 300 palabras, enfocado en el impacto y la importancia del tema para la audiencia profesional.",
};

const SocialCopySchema = z.object({ copy: z.string() });

function buildSystemPrompt({ platform, contentType }) {
  const contentLabel = CONTENT_TYPE_LABELS[contentType];
  const guidance = PLATFORM_GUIDANCE[platform];

  return `Eres el copiloto editorial de PeriodistaIA. Un periodista ya generó ${contentLabel}
y quiere adaptarla para compartirla en redes sociales. ${guidance}
Basa el copy únicamente en el contenido que te da el periodista, sin inventar
datos, cifras ni afirmaciones que no estén en el texto original.
Responde siempre en el mismo idioma del contenido original.`;
}

async function generateSocialCopy({ content, platform, contentType }) {
  const response = await anthropic.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 2048,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(SocialCopySchema),
    },
    system: buildSystemPrompt({ platform, contentType }),
    messages: [{ role: "user", content }],
  });

  return response.parsed_output.copy;
}

module.exports = { generateSocialCopy };
