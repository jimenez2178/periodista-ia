const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");
const { FEATURE_SLUGS, describeFeatures } = require("../../utils/featureCatalog");

const NO_FEATURE = "none";

const TOOLS_RECOMMENDATION_SYSTEM_PROMPT = `Eres el copiloto editorial de PeriodistaIA. Un periodista describe una tarea o
un flujo de trabajo que necesita resolver. Devuelve una recomendación de flujo de
trabajo paso a paso, con herramientas concretas para cada paso.

Funciones que PeriodistaIA tiene hoy (slug entre corchetes):
${describeFeatures()}

Devuelve:
- steps: pasos en orden, cada uno con:
  - order: número de paso.
  - step: qué hacer, en una o dos frases concretas.
  - feature: el slug de la función de PeriodistaIA que resuelve este paso, o "${NO_FEATURE}"
    si ninguna aplica. Usa una función solo si de verdad hace ese paso.
  - tools: herramientas externas reales y conocidas útiles para ese paso (ej. Canva,
    CapCut, Descript, Google Sheets, Datawrapper, InVID). Indica "(pago)" si solo
    funciona pagando. Lista vacía si PeriodistaIA ya cubre el paso.
- periodista_ia_role: explicación breve y concreta de cómo PeriodistaIA ayuda en este flujo,
  nombrando las funciones exactas que aplican.
- copilot_tip: un consejo final corto y personalizado a la tarea descrita.
No inventes funciones de PeriodistaIA que no estén en la lista.
Responde siempre en el mismo idioma en que el periodista escribió su tarea.`;

const ToolsRecommendationSchema = z.object({
  steps: z.array(
    z.object({
      order: z.number(),
      step: z.string(),
      feature: z.enum([...FEATURE_SLUGS, NO_FEATURE]),
      tools: z.array(z.string()),
    })
  ),
  periodista_ia_role: z.string(),
  copilot_tip: z.string(),
});

async function recommendWorkflow({ task }) {
  const response = await anthropic.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(ToolsRecommendationSchema),
    },
    system: TOOLS_RECOMMENDATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: task }],
  });

  const recommendation = response.parsed_output;
  // "none" solo le sirve al modelo; el frontend espera null cuando no hay función.
  recommendation.steps = recommendation.steps.map((step) => ({
    ...step,
    feature: step.feature === NO_FEATURE ? null : step.feature,
  }));
  return recommendation;
}

module.exports = { recommendWorkflow };
