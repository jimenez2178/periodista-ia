const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");
const { supabaseAdmin } = require("../../config/supabase");
const { parseWithWebSearch, keepOnlySearchedUrl } = require("../../utils/webSearch");

// La petición debe responder antes del timeout del proxy (~60 s): con 3 búsquedas
// el kit tardaba ~55 s; con 2, ~40 s y con antecedentes igual de útiles.
const MAX_WEB_SEARCHES = 2;

const INTERVIEW_TYPES = {
  breve: `Es una entrevista breve (unos 10 minutos, por teléfono o en la calle): pocas
preguntas, directas, priorizando lo imprescindible para la nota. basic_questions: 3 a 4;
hard_questions: 2 a 3; follow_up_questions: 2 a 3.`,
  a_fondo: `Es una entrevista a fondo (30 minutos o más): recorre el tema con profundidad.
basic_questions: 5 a 7; hard_questions: 3 a 5; follow_up_questions: 3 a 5.`,
  en_vivo: `Es una entrevista en vivo (radio o TV): preguntas cortas, claras para la
audiencia, que no se respondan con sí o no, y un orden que funcione al aire.
basic_questions: 4 a 5; hard_questions: 2 a 4; follow_up_questions: 2 a 4.`,
};
const INTERVIEW_TYPE_SLUGS = Object.keys(INTERVIEW_TYPES);

function buildSystemPrompt({ interviewType, research, country }) {
  const researchInstructions = research
    ? `Antes de preparar las preguntas, busca en la web al entrevistado y el tema: cargo
actual, declaraciones públicas previas, decisiones, cifras y polémicas recientes.
Usa lo que encuentres para que las preguntas sean específicas (cita declaraciones o
datos concretos cuando sirvan para repreguntar).
- background: hechos públicos relevantes sobre el entrevistado y el tema, cada uno
  indicando de qué fuente y fecha sale. Solo lo que encontraste; nunca inventes.
- sources: solo fuentes que realmente consultaste, cada una como {name, url,
  description}. "url" debe ser exactamente el enlace del resultado de búsqueda.
${country ? `El periodista trabaja en el país con código "${country}": prioriza fuentes de ese país.` : ""}`
    : `No tienes acceso a internet para este kit: no inventes datos específicos sobre el
entrevistado que no te haya dado el periodista; basa las preguntas en el cargo,
el contexto y el tema provistos.`;

  return `Eres el copiloto editorial de PeriodistaIA. Un periodista te da a quién va a
entrevistar (nombre, cargo o contexto disponible), sobre qué tema y, a veces, qué
quiere conseguir con la entrevista. Devuelve un kit de preparación:
- basic_questions: preguntas de contexto para abrir la entrevista y situar al
  entrevistado y al tema.
- hard_questions: preguntas incómodas o directas que pongan a prueba al entrevistado
  sobre los puntos más delicados del tema.
- follow_up_questions: repreguntas para cuando las respuestas sean evasivas o genéricas.
- topics_to_avoid: temas o ángulos que el entrevistado probablemente intentará
  esquivar, con una frase de por qué.
- facts_to_verify: datos, cifras o afirmaciones que el periodista debería verificar
  antes de la entrevista, cada uno redactado como una afirmación concreta que se
  pueda comprobar.
${INTERVIEW_TYPES[interviewType]}
Si el periodista indica su objetivo, orienta todas las preguntas a conseguirlo.
${researchInstructions}
Responde siempre en el mismo idioma en que el periodista escribió el tema.`;
}

const baseKitShape = {
  basic_questions: z.array(z.string()),
  hard_questions: z.array(z.string()),
  follow_up_questions: z.array(z.string()),
  topics_to_avoid: z.array(z.string()),
  facts_to_verify: z.array(z.string()),
};

const InterviewKitSchema = z.object(baseKitShape);

const ResearchedInterviewKitSchema = z.object({
  background: z.array(z.string()),
  ...baseKitShape,
  sources: z.array(
    z.object({
      name: z.string(),
      url: z.string().nullable(),
      description: z.string(),
    })
  ),
});

function buildUserContent({ interviewee, topic, goal }) {
  const parts = [`Entrevistado: ${interviewee}`, `Tema: ${topic}`];
  if (goal) parts.push(`Objetivo del periodista: ${goal}`);
  return parts.join("\n\n");
}

async function generateInterviewKit({ interviewee, topic, goal, interviewType, research, country }) {
  const system = buildSystemPrompt({ interviewType, research, country });
  const messages = [{ role: "user", content: buildUserContent({ interviewee, topic, goal }) }];

  if (!research) {
    const response = await anthropic.messages.parse({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      output_config: { effort: "medium", format: zodOutputFormat(InterviewKitSchema) },
      system,
      messages,
    });
    return response.parsed_output;
  }

  const { parsed, searchUrls } = await parseWithWebSearch({
    maxSearches: MAX_WEB_SEARCHES,
    model: "claude-sonnet-5",
    max_tokens: 8192,
    output_config: { effort: "medium", format: zodOutputFormat(ResearchedInterviewKitSchema) },
    system,
    messages,
  });

  if (!parsed) {
    throw new Error("No pudimos preparar el kit. Intenta de nuevo.");
  }

  parsed.sources = parsed.sources.map((source) => keepOnlySearchedUrl(source, searchUrls));
  return parsed;
}

async function saveInterview({ userId, interviewee, topic, results }) {
  const { data, error } = await supabaseAdmin
    .from("interviews")
    .insert({
      user_id: userId,
      interviewee,
      topic,
      results,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = { generateInterviewKit, saveInterview, INTERVIEW_TYPE_SLUGS };
