const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");

// Datos del perfil que cambian el plan: las fuentes, instituciones y leyes de
// acceso a la información dependen del país.
function buildProfileNote(profile) {
  const parts = [];
  if (profile?.country) parts.push(`país (código): ${profile.country}`);
  if (profile?.city) parts.push(`ciudad: ${profile.city}`);
  if (profile?.workplace) parts.push(`medio o lugar de trabajo: ${profile.workplace}`);
  if (parts.length === 0) return "";
  return `El periodista trabaja en — ${parts.join("; ")}. Propón fuentes, instituciones y
mecanismos de acceso a la información propios de ese país cuando apliquen.`;
}

const PLAN_GUIDANCE = `- hypothesis: la hipótesis central de la historia en una frase: qué habría que demostrar.
- angle_suggestions: ángulos posibles para enfocar la historia.
- key_questions: preguntas clave que debe responder la investigación.
- sources_to_check: fuentes a consultar, cada una como un tipo de persona o institución
  concreta (ej. "Director del hospital regional"); no inventes nombres propios que no conozcas con certeza.
- documents_to_request: documentos, registros o bases de datos a pedir o consultar
  (incluidas solicitudes de acceso a la información pública).
- investigation_steps: pasos concretos de investigación en orden lógico.
- potential_challenges: obstáculos y cuidados, incluidos riesgos legales y éticos.
- kill_criteria: qué hallazgos harían que la historia no se sostenga.
- estimated_time: tiempo estimado para reportearla, en una frase.`;

const PLAN_SYSTEM_PROMPT = `Eres el copiloto editorial de PeriodistaIA. Un periodista te da la idea inicial
de una historia. Devuelve un plan de investigación accionable:
${PLAN_GUIDANCE}
Responde siempre en el mismo idioma en que el periodista escribió la idea.
Sé concreto y práctico, no genérico.`;

const REFINE_SYSTEM_PROMPT = `Eres el copiloto editorial de PeriodistaIA. Un periodista te da su idea, el plan
de investigación actual y un pedido de ajuste (y a veces el ángulo que eligió).
Devuelve el plan completo actualizado: aplica el ajuste, enfoca todo el plan en el
ángulo elegido si lo hay, y conserva lo que siga siendo útil del plan anterior.
${PLAN_GUIDANCE}
Responde siempre en el mismo idioma en que el periodista escribió la idea.`;

const InvestigationPlanSchema = z.object({
  hypothesis: z.string(),
  angle_suggestions: z.array(z.string()),
  key_questions: z.array(z.string()),
  sources_to_check: z.array(z.string()),
  documents_to_request: z.array(z.string()),
  investigation_steps: z.array(z.string()),
  potential_challenges: z.array(z.string()),
  kill_criteria: z.array(z.string()),
  estimated_time: z.string(),
});

// Lo que el periodista puede producir a partir del plan.
const DRAFT_KINDS = {
  pitch: {
    articleType: "pitch",
    prompt: `Escribe un pitch para proponer esta historia al editor. "title": título tentativo
de la historia. "body" (máximo 300 palabras, con subtítulos breves): la historia en dos
frases; por qué importa ahora y a quién afecta; la hipótesis y lo que falta confirmar;
fuentes y documentos previstos; formato sugerido y tiempo estimado. Deja claro qué es
hipótesis y qué está confirmado: todavía no hay reporteo.`,
  },
  skeleton: {
    articleType: "story_skeleton",
    prompt: `Escribe el esqueleto de la nota para que el periodista lo complete mientras
reportea. "title": título tentativo. "body": lead propuesto y la estructura de la nota
párrafo por párrafo, en pirámide invertida. Todavía no hay reporteo: donde haga falta un
dato, cita o cifra, deja un marcador [PENDIENTE: qué dato y de qué fuente obtenerlo].
Nunca inventes cifras, citas ni hechos.`,
  },
  reported: {
    articleType: "news_article",
    prompt: `El periodista ya reporteó y te comparte sus hallazgos. Escribe la nota periodística
lista para publicar: título preciso, lead con el hecho central y cuerpo en pirámide
invertida con tono neutral. Afirma solo lo que respaldan los hallazgos (hechos, cifras,
citas); la idea y el plan son solo contexto. Si algo del plan no aparece en los
hallazgos, no lo presentes como hecho.`,
  },
};
const DRAFT_KIND_SLUGS = Object.keys(DRAFT_KINDS);

const DraftSchema = z.object({ title: z.string(), body: z.string() });

async function parse({ system, content, schema }) {
  const response = await anthropic.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    output_config: { effort: "medium", format: zodOutputFormat(schema) },
    system,
    messages: [{ role: "user", content }],
  });
  return response.parsed_output;
}

function withProfile(system, profile) {
  const note = buildProfileNote(profile);
  return note ? `${system}\n${note}` : system;
}

// El progreso de los pasos no le sirve a la IA; se quita antes de enviarle el plan.
function planForPrompt(plan) {
  const { completed_steps: _completedSteps, ...rest } = plan;
  return JSON.stringify(rest, null, 2);
}

async function generateInvestigationPlan({ idea, profile }) {
  return parse({ system: withProfile(PLAN_SYSTEM_PROMPT, profile), content: idea, schema: InvestigationPlanSchema });
}

async function refineInvestigationPlan({ idea, plan, instruction, angle, profile }) {
  const parts = [`Idea:\n${idea}`, `Plan actual:\n${planForPrompt(plan)}`];
  if (angle) parts.push(`Ángulo elegido:\n${angle}`);
  if (instruction) parts.push(`Ajuste pedido:\n${instruction}`);

  return parse({
    system: withProfile(REFINE_SYSTEM_PROMPT, profile),
    content: parts.join("\n\n"),
    schema: InvestigationPlanSchema,
  });
}

async function generateIdeaDraft({ kind, idea, plan, angle, reporting, profile }) {
  const parts = [`Idea:\n${idea}`, `Plan de investigación:\n${planForPrompt(plan)}`];
  if (angle) parts.push(`Ángulo elegido:\n${angle}`);
  if (reporting) parts.push(`Hallazgos del reporteo:\n${reporting}`);

  const system = withProfile(
    `Eres el copiloto editorial de PeriodistaIA.\n${DRAFT_KINDS[kind].prompt}\nResponde siempre en el mismo idioma en que el periodista escribió la idea.`,
    profile
  );
  return parse({ system, content: parts.join("\n\n"), schema: DraftSchema });
}

module.exports = {
  DRAFT_KINDS,
  DRAFT_KIND_SLUGS,
  generateInvestigationPlan,
  refineInvestigationPlan,
  generateIdeaDraft,
};
