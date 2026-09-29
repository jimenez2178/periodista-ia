const { supabaseAdmin } = require("../../config/supabase");

// Una sesión de "Tengo una idea" guarda dos mensajes: la idea (user) y la versión
// vigente del plan en JSON (assistant). Refinar el plan o marcar pasos reescribe
// ese mensaje, así el historial y los proyectos siempre muestran el plan actual.
async function createIdeaSession({ userId, projectId, idea, plan }) {
  const title = idea.length > 80 ? `${idea.slice(0, 80)}…` : idea;

  const { data: session, error: sessionError } = await supabaseAdmin
    .from("sessions")
    .insert({ user_id: userId, project_id: projectId || null, function_used: "idea", title })
    .select()
    .single();

  if (sessionError) throw sessionError;

  const { error: messagesError } = await supabaseAdmin.from("messages").insert([
    { session_id: session.id, role: "user", content: idea },
    { session_id: session.id, role: "assistant", content: JSON.stringify(plan) },
  ]);

  if (messagesError) throw messagesError;

  return session;
}

async function getIdeaSession({ userId, sessionId }) {
  const { data: session, error } = await supabaseAdmin
    .from("sessions")
    .select("id, project_id, messages(id, role, content)")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .eq("function_used", "idea")
    .maybeSingle();

  if (error) throw error;
  if (!session) return null;

  const ideaMessage = session.messages.find((m) => m.role === "user");
  const planMessage = session.messages.find((m) => m.role === "assistant");
  if (!ideaMessage || !planMessage) return null;

  let plan;
  try {
    plan = JSON.parse(planMessage.content);
  } catch {
    return null;
  }

  return {
    id: session.id,
    projectId: session.project_id,
    idea: ideaMessage.content,
    plan,
    planMessageId: planMessage.id,
  };
}

async function updateIdeaPlan({ sessionId, planMessageId, plan }) {
  const { error } = await supabaseAdmin
    .from("messages")
    .update({ content: JSON.stringify(plan) })
    .eq("id", planMessageId)
    .eq("session_id", sessionId);

  if (error) throw error;

  await supabaseAdmin.from("sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);
}

module.exports = { createIdeaSession, getIdeaSession, updateIdeaPlan };
