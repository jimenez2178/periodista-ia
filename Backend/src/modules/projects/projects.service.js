const { supabaseAdmin } = require("../../config/supabase");

const ITEM_TABLES = {
  article: "articles",
  source: "sources",
  transcription: "transcriptions",
};

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

function normalizeItems({ articles, sources, transcriptions, sessions }) {
  const items = [
    ...articles.map((a) => ({
      id: a.id,
      type: "article",
      title: a.title,
      subtitle: truncate(a.body),
      created_at: a.created_at,
    })),
    ...sources.map((s) => ({
      id: s.id,
      type: "source",
      title: s.claim,
      subtitle: `${s.verdict} — ${truncate(s.explanation)}`,
      created_at: s.created_at,
    })),
    ...transcriptions.map((t) => ({
      id: t.id,
      type: "transcription",
      title: "Transcripción de audio",
      subtitle: truncate(t.transcript_text),
      created_at: t.created_at,
    })),
    ...sessions.map((s) => ({
      id: s.id,
      type: "idea",
      title: s.title || "Idea",
      subtitle: summarizePlan((s.messages || []).find((m) => m.role === "assistant")?.content),
      created_at: s.created_at,
    })),
  ];

  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return items;
}

async function listProjectsForUser(userId) {
  const { data: projects, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const withCounts = await Promise.all(
    projects.map(async (project) => {
      const [articles, sources, transcriptions, sessions] = await Promise.all([
        supabaseAdmin.from("articles").select("id", { count: "exact", head: true }).eq("project_id", project.id),
        supabaseAdmin.from("sources").select("id", { count: "exact", head: true }).eq("project_id", project.id),
        supabaseAdmin
          .from("transcriptions")
          .select("id", { count: "exact", head: true })
          .eq("project_id", project.id),
        supabaseAdmin.from("sessions").select("id", { count: "exact", head: true }).eq("project_id", project.id),
      ]);

      const item_count = (articles.count || 0) + (sources.count || 0) + (transcriptions.count || 0) + (sessions.count || 0);
      return { ...project, item_count };
    })
  );

  return withCounts;
}

async function createProject({ userId, title, description }) {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .insert({ user_id: userId, title, description: description || null })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getProjectWithItems({ projectId, userId }) {
  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (projectError || !project) return null;

  const [articlesRes, sourcesRes, transcriptionsRes, sessionsRes] = await Promise.all([
    supabaseAdmin.from("articles").select("id, title, body, created_at").eq("project_id", projectId),
    supabaseAdmin.from("sources").select("id, claim, verdict, explanation, created_at").eq("project_id", projectId),
    supabaseAdmin.from("transcriptions").select("id, transcript_text, created_at").eq("project_id", projectId),
    supabaseAdmin
      .from("sessions")
      .select("id, title, created_at, messages(role, content)")
      .eq("project_id", projectId)
      .eq("function_used", "idea"),
  ]);

  if (articlesRes.error) throw articlesRes.error;
  if (sourcesRes.error) throw sourcesRes.error;
  if (transcriptionsRes.error) throw transcriptionsRes.error;
  if (sessionsRes.error) throw sessionsRes.error;

  const items = normalizeItems({
    articles: articlesRes.data,
    sources: sourcesRes.data,
    transcriptions: transcriptionsRes.data,
    sessions: sessionsRes.data,
  });

  return { ...project, items };
}

async function attachItemToProject({ userId, projectId, type, itemId }) {
  const table = ITEM_TABLES[type];
  if (!table) throw new Error("Tipo de elemento inválido.");

  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (projectError || !project) throw new Error("Proyecto no encontrado.");

  const { data, error } = await supabaseAdmin
    .from(table)
    .update({ project_id: projectId })
    .eq("id", itemId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) throw new Error("No se pudo guardar en el proyecto.");
  return data;
}

module.exports = { listProjectsForUser, createProject, getProjectWithItems, attachItemToProject };
