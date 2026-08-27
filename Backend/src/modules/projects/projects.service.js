const { supabaseAdmin } = require("../../config/supabase");

const ITEM_TABLES = {
  article: "articles",
  source: "sources",
  transcription: "transcriptions",
  document: "documents",
};

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

function normalizeItems({ articles, sources, transcriptions, sessions, documents }) {
  const items = [
    ...articles.map((a) => ({
      id: a.id,
      type: "article",
      title: a.title,
      subtitle: truncate(a.body),
      created_at: a.created_at,
      detail: { title: a.title, body: a.body },
    })),
    ...sources.map((s) => ({
      id: s.id,
      type: "source",
      title: s.claim,
      subtitle: `${s.verdict} — ${truncate(s.explanation)}`,
      created_at: s.created_at,
      detail: {
        claim: s.claim,
        verdict: s.verdict,
        confidence_level: s.confidence_level,
        explanation: s.explanation,
        sources_used: s.sources_used || [],
      },
    })),
    ...transcriptions.map((t) => ({
      id: t.id,
      type: "transcription",
      title: "Transcripción de audio",
      subtitle: truncate(t.transcript_text),
      created_at: t.created_at,
      detail: { transcript_text: t.transcript_text },
    })),
    ...sessions.map((s) => {
      const idea = (s.messages || []).find((m) => m.role === "user")?.content;
      const plan = parsePlan((s.messages || []).find((m) => m.role === "assistant")?.content);
      return {
        id: s.id,
        type: "idea",
        title: s.title || "Idea",
        subtitle: summarizePlan(plan),
        created_at: s.created_at,
        detail: { idea: idea || s.title, plan },
      };
    }),
    ...documents.map((d) => ({
      id: d.id,
      type: "document",
      title: d.file_name,
      subtitle: summarizeDocument(d.analysis_types),
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

async function listProjectsForUser(userId) {
  const { data: projects, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const withCounts = await Promise.all(
    projects.map(async (project) => {
      const [articles, sources, transcriptions, sessions, documents] = await Promise.all([
        supabaseAdmin.from("articles").select("id", { count: "exact", head: true }).eq("project_id", project.id),
        supabaseAdmin.from("sources").select("id", { count: "exact", head: true }).eq("project_id", project.id),
        supabaseAdmin
          .from("transcriptions")
          .select("id", { count: "exact", head: true })
          .eq("project_id", project.id),
        supabaseAdmin.from("sessions").select("id", { count: "exact", head: true }).eq("project_id", project.id),
        supabaseAdmin.from("documents").select("id", { count: "exact", head: true }).eq("project_id", project.id),
      ]);

      const item_count =
        (articles.count || 0) +
        (sources.count || 0) +
        (transcriptions.count || 0) +
        (sessions.count || 0) +
        (documents.count || 0);
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

  const [articlesRes, sourcesRes, transcriptionsRes, sessionsRes, documentsRes] = await Promise.all([
    supabaseAdmin.from("articles").select("id, title, body, created_at").eq("project_id", projectId),
    supabaseAdmin
      .from("sources")
      .select("id, claim, verdict, confidence_level, explanation, sources_used, created_at")
      .eq("project_id", projectId),
    supabaseAdmin.from("transcriptions").select("id, transcript_text, created_at").eq("project_id", projectId),
    supabaseAdmin
      .from("sessions")
      .select("id, title, created_at, messages(role, content)")
      .eq("project_id", projectId)
      .eq("function_used", "idea"),
    supabaseAdmin
      .from("documents")
      .select("id, file_name, file_type, analysis_types, results, created_at")
      .eq("project_id", projectId),
  ]);

  if (articlesRes.error) throw articlesRes.error;
  if (sourcesRes.error) throw sourcesRes.error;
  if (transcriptionsRes.error) throw transcriptionsRes.error;
  if (sessionsRes.error) throw sessionsRes.error;
  if (documentsRes.error) throw documentsRes.error;

  const items = normalizeItems({
    articles: articlesRes.data,
    sources: sourcesRes.data,
    transcriptions: transcriptionsRes.data,
    sessions: sessionsRes.data,
    documents: documentsRes.data,
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

async function deleteProject({ userId, projectId }) {
  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (projectError || !project) throw new Error("Proyecto no encontrado.");

  // Los elementos guardados (notas, verificaciones, transcripciones, ideas) no se
  // borran: solo se desvinculan del proyecto y siguen visibles en el historial.
  await Promise.all([
    ...Object.values(ITEM_TABLES).map((table) =>
      supabaseAdmin.from(table).update({ project_id: null }).eq("project_id", projectId)
    ),
    supabaseAdmin.from("sessions").update({ project_id: null }).eq("project_id", projectId),
  ]);

  const { error } = await supabaseAdmin.from("projects").delete().eq("id", projectId);
  if (error) throw error;
}

module.exports = {
  listProjectsForUser,
  createProject,
  getProjectWithItems,
  attachItemToProject,
  deleteProject,
};
