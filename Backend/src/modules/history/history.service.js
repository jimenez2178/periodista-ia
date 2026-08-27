const { supabaseAdmin } = require("../../config/supabase");

function truncate(text, length = 160) {
  if (!text) return "";
  const clean = text.trim();
  return clean.length > length ? `${clean.slice(0, length)}…` : clean;
}

function summarizePlan(content) {
  if (!content) return "Plan de investigación guardado.";
  try {
    const plan = JSON.parse(content);
    return truncate(plan.angle_suggestions?.[0]) || "Plan de investigación guardado.";
  } catch {
    return truncate(content);
  }
}

async function listHistoryForUser(userId) {
  const [articlesRes, sourcesRes, transcriptionsRes, sessionsRes] = await Promise.all([
    supabaseAdmin
      .from("articles")
      .select("id, title, body, project_id, created_at")
      .eq("user_id", userId),
    supabaseAdmin
      .from("sources")
      .select("id, claim, verdict, explanation, project_id, created_at")
      .eq("user_id", userId),
    supabaseAdmin
      .from("transcriptions")
      .select("id, transcript_text, project_id, created_at")
      .eq("user_id", userId),
    supabaseAdmin
      .from("sessions")
      .select("id, title, project_id, created_at, messages(role, content)")
      .eq("user_id", userId)
      .eq("function_used", "idea"),
  ]);

  if (articlesRes.error) throw articlesRes.error;
  if (sourcesRes.error) throw sourcesRes.error;
  if (transcriptionsRes.error) throw transcriptionsRes.error;
  if (sessionsRes.error) throw sessionsRes.error;

  const items = [
    ...articlesRes.data.map((a) => ({
      id: a.id,
      type: "article",
      title: a.title,
      subtitle: truncate(a.body),
      project_id: a.project_id,
      created_at: a.created_at,
    })),
    ...sourcesRes.data.map((s) => ({
      id: s.id,
      type: "source",
      title: s.claim,
      subtitle: `${s.verdict} — ${truncate(s.explanation)}`,
      project_id: s.project_id,
      created_at: s.created_at,
    })),
    ...transcriptionsRes.data.map((t) => ({
      id: t.id,
      type: "transcription",
      title: "Transcripción de audio",
      subtitle: truncate(t.transcript_text),
      project_id: t.project_id,
      created_at: t.created_at,
    })),
    ...sessionsRes.data.map((s) => ({
      id: s.id,
      type: "idea",
      title: s.title || "Idea",
      subtitle: summarizePlan((s.messages || []).find((m) => m.role === "assistant")?.content),
      project_id: s.project_id,
      created_at: s.created_at,
    })),
  ];

  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return items;
}

module.exports = { listHistoryForUser };
