const { supabaseAdmin } = require("../../config/supabase");
const { ITEM_COLUMNS, normalizeItems } = require("../../utils/itemNormalizer");

const ITEM_TABLES = {
  article: "articles",
  source: "sources",
  transcription: "transcriptions",
  document: "documents",
  interview: "interviews",
  idea: "sessions",
};

async function listProjectsForUser(userId) {
  const { data: projects, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Una consulta por tabla (no una por proyecto y tabla): se cuentan los
  // elementos vinculados de todos los proyectos del usuario a la vez.
  const tables = [...new Set(Object.values(ITEM_TABLES))];
  const results = await Promise.all(
    tables.map((table) =>
      supabaseAdmin.from(table).select("project_id").eq("user_id", userId).not("project_id", "is", null)
    )
  );

  const counts = {};
  for (const { data, error: countError } of results) {
    if (countError) throw countError;
    for (const row of data) counts[row.project_id] = (counts[row.project_id] || 0) + 1;
  }

  return projects.map((project) => ({ ...project, item_count: counts[project.id] || 0 }));
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

  const [articles, sources, transcriptions, sessions, documents, interviews] = await Promise.all([
    supabaseAdmin.from("articles").select(ITEM_COLUMNS.articles).eq("project_id", projectId).eq("user_id", userId),
    supabaseAdmin.from("sources").select(ITEM_COLUMNS.sources).eq("project_id", projectId).eq("user_id", userId),
    supabaseAdmin
      .from("transcriptions")
      .select(ITEM_COLUMNS.transcriptions)
      .eq("project_id", projectId)
      .eq("user_id", userId),
    supabaseAdmin
      .from("sessions")
      .select(ITEM_COLUMNS.sessions)
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .eq("function_used", "idea"),
    supabaseAdmin.from("documents").select(ITEM_COLUMNS.documents).eq("project_id", projectId).eq("user_id", userId),
    supabaseAdmin.from("interviews").select(ITEM_COLUMNS.interviews).eq("project_id", projectId).eq("user_id", userId),
  ]);

  for (const res of [articles, sources, transcriptions, sessions, documents, interviews]) {
    if (res.error) throw res.error;
  }

  const items = normalizeItems({
    articles: articles.data,
    sources: sources.data,
    transcriptions: transcriptions.data,
    sessions: sessions.data,
    documents: documents.data,
    interviews: interviews.data,
  });

  return { ...project, items };
}

async function updateProject({ userId, projectId, title, description }) {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .update({ title, description: description || null, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Quita un elemento del proyecto sin borrarlo: sigue en el historial.
async function detachItemFromProject({ userId, projectId, type, itemId }) {
  const table = ITEM_TABLES[type];
  if (!table) throw new Error("Tipo de elemento inválido.");

  const { data, error } = await supabaseAdmin
    .from(table)
    .update({ project_id: null })
    .eq("id", itemId)
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data;
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
  await Promise.all(
    Object.values(ITEM_TABLES).map((table) =>
      supabaseAdmin.from(table).update({ project_id: null }).eq("project_id", projectId)
    )
  );

  const { error } = await supabaseAdmin.from("projects").delete().eq("id", projectId);
  if (error) throw error;
}

module.exports = {
  listProjectsForUser,
  createProject,
  getProjectWithItems,
  updateProject,
  attachItemToProject,
  detachItemFromProject,
  deleteProject,
};
