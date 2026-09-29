const { supabaseAdmin } = require("../../config/supabase");
const { ITEM_COLUMNS, normalizeItems } = require("../../utils/itemNormalizer");

async function listHistoryForUser(userId) {
  const [articles, sources, transcriptions, sessions, documents, interviews] = await Promise.all([
    supabaseAdmin.from("articles").select(ITEM_COLUMNS.articles).eq("user_id", userId),
    supabaseAdmin.from("sources").select(ITEM_COLUMNS.sources).eq("user_id", userId),
    supabaseAdmin.from("transcriptions").select(ITEM_COLUMNS.transcriptions).eq("user_id", userId),
    supabaseAdmin.from("sessions").select(ITEM_COLUMNS.sessions).eq("user_id", userId).eq("function_used", "idea"),
    supabaseAdmin.from("documents").select(ITEM_COLUMNS.documents).eq("user_id", userId),
    supabaseAdmin.from("interviews").select(ITEM_COLUMNS.interviews).eq("user_id", userId),
  ]);

  for (const res of [articles, sources, transcriptions, sessions, documents, interviews]) {
    if (res.error) throw res.error;
  }

  return normalizeItems({
    articles: articles.data,
    sources: sources.data,
    transcriptions: transcriptions.data,
    sessions: sessions.data,
    documents: documents.data,
    interviews: interviews.data,
  });
}

module.exports = { listHistoryForUser };
