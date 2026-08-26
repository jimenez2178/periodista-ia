const anthropic = require("../../config/anthropic");

const ASSISTANT_SYSTEM_PROMPT = `Eres el asistente de soporte de PeriodistaIA.
Tu único trabajo es ayudar a los usuarios a entender cómo usar las funciones de la app:
Audio a Nota, Tengo una idea, Verificar fuentes, y el Perfil.
Responde siempre en el mismo idioma que el usuario.
Sé breve, claro y amigable. No hagas trabajo periodístico — solo explica cómo usar la herramienta.
No uses formato Markdown (nada de asteriscos ni #), responde en texto plano.`;

async function getAssistantReply(message, history = []) {
  const messages = [...history, { role: "user", content: message }];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: ASSISTANT_SYSTEM_PROMPT,
    messages,
  });

  return response.content[0].text;
}

module.exports = { getAssistantReply };
