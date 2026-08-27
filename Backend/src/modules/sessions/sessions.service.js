const { supabaseAdmin } = require("../../config/supabase");

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

module.exports = { createIdeaSession };
