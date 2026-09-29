const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const { supabaseAdmin } = require("../../config/supabase");
const { parseWithWebSearch, keepOnlySearchedUrl } = require("../../utils/webSearch");

// Pocas búsquedas por verificación: cada una suma segundos y la petición debe
// responder antes del timeout del proxy (~60 s).
const MAX_WEB_SEARCHES = 3;

function buildSystemPrompt({ country, languageVariant }) {
  const countryNote = country
    ? `El periodista trabaja en el país con código "${country}": si la afirmación es local, busca y prioriza fuentes de ese país.`
    : "";

  const localeNote =
    country || languageVariant
      ? `El periodista es de ${country || "un país hispanohablante"}${
          languageVariant ? ` (variante de español: ${languageVariant})` : ""
        }. Frasea "verdict_label" de forma natural para esa variante, sin cambiar el significado del veredicto.`
      : `No se conoce el país del periodista: usa un español neutro para "verdict_label".`;

  const today = new Date().toISOString().slice(0, 10);

  return `Eres el copiloto editorial de PeriodistaIA. Un periodista te da una afirmación
que quiere verificar antes de publicarla, a veces con contexto (quién la dijo, dónde,
cuándo). Hoy es ${today}.

Busca en la web para contrastarla. Prioriza fuentes primarias y oficiales (organismos
públicos, documentos oficiales, datos estadísticos, registros) y medios reconocidos;
contrasta con más de una fuente cuando puedas y fíjate en la fecha de cada fuente.
${countryNote}
Si no encuentras respaldo suficiente, responde "unverified" o "inconclusive": es
preferible a forzar un veredicto.
Responde siempre en el mismo idioma en que el periodista escribió la afirmación.

Además de verdict, confidence_level y explanation, responde:
- verdict_label: el veredicto (verified/false/unverified/inconclusive) expresado como
  una etiqueta corta en español, natural para el periodista. ${localeNote}
- evidence_found: hechos o datos concretos que encontraste y que respaldan o
  contradicen la afirmación, indicando de qué fuente sale cada uno. Array vacío si no
  encontraste evidencia concreta — nunca rellenes con generalidades.
- sources_used: solo fuentes que realmente consultaste en la búsqueda, cada una como
  {name, url, description}. "url" debe ser exactamente el enlace del resultado de
  búsqueda; nunca inventes una URL. "description" explica en una frase qué aporta.
- what_to_verify: pasos concretos y accionables que el periodista debería confirmar
  por su cuenta antes de publicar (a quién llamar, qué documento pedir, qué dato
  cruzar). Siempre algo específico a esta afirmación — nunca una recomendación
  genérica como "verifica la fuente".`;
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

function buildUserContent({ claim, context }) {
  if (!context) return claim;
  return `Afirmación a verificar:\n${claim}\n\nContexto del periodista:\n${context}`;
}

async function generateVerification({ claim, context, country, languageVariant }) {
  const { parsed: result, searchUrls } = await parseWithWebSearch({
    maxSearches: MAX_WEB_SEARCHES,
    model: "claude-sonnet-5",
    max_tokens: 8192,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(VerificationResultSchema),
    },
    system: buildSystemPrompt({ country, languageVariant }),
    messages: [{ role: "user", content: buildUserContent({ claim, context }) }],
  });

  if (!result) {
    throw new Error("No pudimos completar la verificación. Intenta de nuevo.");
  }

  result.sources_used = result.sources_used.map((source) => keepOnlySearchedUrl(source, searchUrls));
  return result;
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
