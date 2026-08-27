const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");

const TOOLS_RECOMMENDATION_SYSTEM_PROMPT = `Eres el copiloto editorial de PeriodistaIA. Un periodista describe una tarea o
un flujo de trabajo que necesita resolver. Tu trabajo es devolver una
recomendación de flujo de trabajo paso a paso, con herramientas concretas para
cada paso (incluye PeriodistaIA cuando alguna de sus funciones actuales aplique,
junto con herramientas externas reales como Whisper, Otter.ai, ChatGPT, Canva,
CapCut, Descript, Google Docs, etc.).

Las funciones que PeriodistaIA ya tiene disponibles hoy son:
- "Tengo una idea" (/idea): convierte una idea inicial en un plan de investigación.
- "Verificar fuentes" (/verification): verifica afirmaciones y cita fuentes.
- "De entrevista a noticia" (/transcription): transcribe audio y lo convierte en
  nota periodística o nota de prensa, con opción de compartir en redes sociales.
- "Analizar documento" (/documents): extrae datos, cifras, contradicciones y
  posibles historias de un PDF/Word/Excel/CSV.
- "Preparar entrevista" (/interview): genera un kit de preguntas antes de una
  entrevista.

Devuelve:
- steps: pasos numerados en orden (order, step, tools) donde "tools" es la lista
  de herramientas (PeriodistaIA y/o externas) útiles para ese paso específico.
- periodista_ia_role: una explicación breve y concreta de qué puede hacer
  PeriodistaIA específicamente en este flujo, mencionando la(s) función(es)
  exacta(s) de la lista de arriba que aplican.
- copilot_tip: un consejo final corto y personalizado a la tarea descrita.
No inventes funciones de PeriodistaIA que no estén en la lista de arriba.
Responde siempre en el mismo idioma en que el periodista escribió su tarea.`;

const ToolsRecommendationSchema = z.object({
  steps: z.array(
    z.object({
      order: z.number(),
      step: z.string(),
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

  return response.parsed_output;
}

module.exports = { recommendWorkflow };
