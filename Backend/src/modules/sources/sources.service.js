const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");
const { supabaseAdmin } = require("../../config/supabase");

function buildSystemPrompt({ country, languageVariant }) {
  const localeNote =
    country || languageVariant
      ? `El periodista es de ${country || "un país hispanohablante"}${
          languageVariant ? ` (variante de español: ${languageVariant})` : ""
        }. Frasea "verdict_label" de forma natural para esa variante, sin cambiar el significado del veredicto.`
      : `No se conoce el país del periodista: usa un español neutro para "verdict_label".`;

  return `Eres el copiloto editorial de PeriodistaIA. Un periodista te da una afirmación
que quiere verificar antes de publicarla. Evalúa si tiene respaldo real basándote
en tu conocimiento. No inventes fuentes específicas (nombres de medios, artículos
o enlaces) si no las conoces con certeza — es preferible responder "unverified" o
"inconclusive" a fabricar una fuente. Sé honesto sobre los límites de lo que puedes
confirmar sin acceso a internet en tiempo real.
Responde siempre en el mismo idioma en que el periodista escribió la afirmación.

Además de verdict, confidence_level y explanation, responde:
- verdict_label: el veredicto (verified/false/unverified/inconclusive) expresado como
  una etiqueta corta en español, natural para el periodista. ${localeNote}
- evidence_found: hechos o datos concretos que encontraste y que respaldan o
  contradicen la afirmación. Array vacío si no encontraste evidencia concreta —
  nunca rellenes con generalidades.
- sources_used: cada fuente como {name, url, description}. "url" solo si conoces
  el enlace real con certeza; si no, usa null (nunca inventes una URL). "description"
  explica en una frase qué aporta esa fuente.
- what_to_verify: pasos concretos y accionables que el periodista debería confirmar
  por su cuenta antes de publicar. Siempre da algo útil y específico a esta
  afirmación — nunca una recomendación genérica como "verifica la fuente".`;
}

const VerificationResultSchema = z.object({
  verdict: z.enum(["verified", "false", "unverified", "inconclusive"]),
  confidence_level: z.enum(["high", "medium", "low"]),
  verdict_label: z.string(),
  explanation: z.string(),
  evidence_found: z.array(z.string()),
  sources_used: z.array(
    z.object({
      name: z.string(),
      url: z.string().nullable(),
      description: z.string(),
    })
  ),
  what_to_verify: z.array(z.string()),
});

async function generateVerification({ claim, country, languageVariant }) {
  const response = await anthropic.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(VerificationResultSchema),
    },
    system: buildSystemPrompt({ country, languageVariant }),
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
      verdict_label: result.verdict_label,
      confidence_level: result.confidence_level,
      explanation: result.explanation,
      evidence_found: result.evidence_found,
      sources_used: result.sources_used,
      what_to_verify: result.what_to_verify,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = { generateVerification, saveSourceVerification };
