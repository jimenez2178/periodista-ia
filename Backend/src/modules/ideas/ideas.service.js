const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");

const IDEA_SYSTEM_PROMPT = `Eres el copiloto editorial de PeriodistaIA. Un periodista te da la idea inicial
de una historia. Tu trabajo es devolver un plan de investigación accionable:
ángulos posibles para enfocar la historia, preguntas clave que debe responder
la investigación, tipos de fuentes que debería consultar (no inventes fuentes
específicas si no las conoces con certeza), pasos concretos de investigación en
orden lógico, y posibles obstáculos o cuidados a tener en cuenta.
Responde siempre en el mismo idioma en que el periodista escribió la idea.
Sé concreto y práctico, no genérico.`;

const InvestigationPlanSchema = z.object({
  angle_suggestions: z.array(z.string()),
  key_questions: z.array(z.string()),
  sources_to_check: z.array(z.string()),
  investigation_steps: z.array(z.string()),
  potential_challenges: z.array(z.string()),
});

async function generateInvestigationPlan(idea) {
  const response = await anthropic.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(InvestigationPlanSchema),
    },
    system: IDEA_SYSTEM_PROMPT,
    messages: [{ role: "user", content: idea }],
  });

  return response.parsed_output;
}

module.exports = { generateInvestigationPlan };
