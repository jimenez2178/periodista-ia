const { supabaseAdmin } = require("../../config/supabase");

function truncate(text, length = 160) {
  if (!text) return "";
  const clean = text.trim();
  return clean.length > length ? `${clean.slice(0, length)}…` : clean;
}

function parsePlan(content) {
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function summarizePlan(plan) {
  return truncate(plan?.angle_suggestions?.[0]) || "Plan de investigación guardado.";
}

function summarizeDocument(analysisTypes) {
  const count = (analysisTypes || []).length;
  return count === 1 ? "1 tipo de análisis" : `${count} tipos de análisis`;
}

async function listHistoryForUser(userId) {
  const [articlesRes, sourcesRes, transcriptionsRes, sessionsRes, documentsRes] = await Promise.all([
    supabaseAdmin
      .from("articles")
      .select("id, title, body, project_id, created_at")
      .eq("user_id", userId),
    supabaseAdmin
      .from("sources")
      .select("id, claim, verdict, confidence_level, explanation, sources_used, project_id, created_at")
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
    supabaseAdmin
      .from("documents")
      .select("id, file_name, file_type, analysis_types, results, project_id, created_at")
      .eq("user_id", userId),
  ]);

  if (articlesRes.error) throw articlesRes.error;
  if (sourcesRes.error) throw sourcesRes.error;
  if (transcriptionsRes.error) throw transcriptionsRes.error;
  if (sessionsRes.error) throw sessionsRes.error;
  if (documentsRes.error) throw documentsRes.error;

  const items = [
    ...articlesRes.data.map((a) => ({
      id: a.id,
      type: "article",
      title: a.title,
      subtitle: truncate(a.body),
      project_id: a.project_id,
      created_at: a.created_at,
      detail: { title: a.title, body: a.body },
    })),
    ...sourcesRes.data.map((s) => ({
      id: s.id,
      type: "source",
      title: s.claim,
      subtitle: `${s.verdict} — ${truncate(s.explanation)}`,
      project_id: s.project_id,
      created_at: s.created_at,
      detail: {
        claim: s.claim,
        verdict: s.verdict,
        confidence_level: s.confidence_level,
        explanation: s.explanation,
        sources_used: s.sources_used || [],
      },
    })),
    ...transcriptionsRes.data.map((t) => ({
      id: t.id,
      type: "transcription",
      title: "Transcripción de audio",
      subtitle: truncate(t.transcript_text),
      project_id: t.project_id,
      created_at: t.created_at,
      detail: { transcript_text: t.transcript_text },
    })),
    ...sessionsRes.data.map((s) => {
      const idea = (s.messages || []).find((m) => m.role === "user")?.content;
      const plan = parsePlan((s.messages || []).find((m) => m.role === "assistant")?.content);
      return {
        id: s.id,
        type: "idea",
        title: s.title || "Idea",
        subtitle: summarizePlan(plan),
        project_id: s.project_id,
        created_at: s.created_at,
        detail: { idea: idea || s.title, plan },
      };
    }),
    ...documentsRes.data.map((d) => ({
      id: d.id,
      type: "document",
      title: d.file_name,
      subtitle: summarizeDocument(d.analysis_types),
      project_id: d.project_id,
      created_at: d.created_at,
      detail: {
        file_name: d.file_name,
        file_type: d.file_type,
        analysis_types: d.analysis_types,
        results: d.results,
      },
    })),
  ];

  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return items;
}

module.exports = { listHistoryForUser };
