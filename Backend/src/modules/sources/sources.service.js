const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");
const { supabaseAdmin } = require("../../config/supabase");

const VERIFICATION_SYSTEM_PROMPT = `Eres el copiloto editorial de PeriodistaIA. Un periodista te da una afirmación
que quiere verificar antes de publicarla. Evalúa si tiene respaldo real basándote
en tu conocimiento. No inventes fuentes específicas (nombres de medios, artículos
o enlaces) si no las conoces con certeza — es preferible responder "unverified" o
"inconclusive" a fabricar una fuente. Sé honesto sobre los límites de lo que puedes
confirmar sin acceso a internet en tiempo real.
Responde siempre en el mismo idioma en que el periodista escribió la afirmación.`;

const VerificationResultSchema = z.object({
  verdict: z.enum(["verified", "false", "unverified", "inconclusive"]),
  confidence_level: z.enum(["high", "medium", "low"]),
  explanation: z.string(),
  sources_used: z.array(z.string()),
});

async function generateVerification(claim) {
  const response = await anthropic.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(VerificationResultSchema),
    },
    system: VERIFICATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: claim }],
  });

  return response.parsed_output;
}

async function saveSourceVerification({ userId, claim, result }) {
  const { data, error } = await supabaseAdmin
    .from("sources")
    .insert({
      user_id: userId,
      claim,
      verdict: result.verdict,
      confidence_level: result.confidence_level,
      explanation: result.explanation,
      sources_used: result.sources_used,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = { generateVerification, saveSourceVerification };
