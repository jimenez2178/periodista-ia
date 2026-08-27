const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");
const { supabaseAdmin } = require("../../config/supabase");

const INTERVIEW_KIT_SYSTEM_PROMPT = `Eres el copiloto editorial de PeriodistaIA. Un periodista te da a quién va a
entrevistar (nombre, cargo o contexto disponible) y sobre qué tema, antes de que
la entrevista ocurra. Tu trabajo es devolver un kit completo de preparación:
- basic_questions: 5 a 7 preguntas de contexto para abrir la entrevista y situar
  al entrevistado y al tema.
- hard_questions: 3 a 5 preguntas incómodas o directas que pongan a prueba al
  entrevistado sobre los puntos más delicados del tema.
- follow_up_questions: 3 a 5 preguntas de seguimiento para profundizar en
  respuestas evasivas o genéricas.
- topics_to_avoid: temas o ángulos que el entrevistado probablemente intentará
  esquivar, con una frase de por qué.
- facts_to_verify: datos, cifras o afirmaciones que el periodista debería
  verificar antes de la entrevista (homework previo).
No inventes datos específicos sobre el entrevistado que no te haya dado el
periodista — basa las preguntas en el cargo/contexto y el tema provistos.
Responde siempre en el mismo idioma en que el periodista escribió el tema.`;

const InterviewKitSchema = z.object({
  basic_questions: z.array(z.string()),
  hard_questions: z.array(z.string()),
  follow_up_questions: z.array(z.string()),
  topics_to_avoid: z.array(z.string()),
  facts_to_verify: z.array(z.string()),
});

async function generateInterviewKit({ interviewee, topic }) {
  const response = await anthropic.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(InterviewKitSchema),
    },
    system: INTERVIEW_KIT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Entrevistado: ${interviewee}\n\nTema: ${topic}` }],
  });

  return response.parsed_output;
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

module.exports = { generateInterviewKit, saveInterview };
