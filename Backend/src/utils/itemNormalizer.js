// Convierte las filas de cada tabla en los "elementos" que muestran el historial y
// los proyectos. Un solo lugar para ambos: así ningún tipo queda fuera de uno de ellos.

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
  return truncate(plan?.hypothesis || plan?.angle_suggestions?.[0]) || "Plan de investigación guardado.";
}

function summarizeDocument(analysisTypes) {
  const count = (analysisTypes || []).length;
  return count === 1 ? "1 tipo de análisis" : `${count} tipos de análisis`;
}

// Columnas que cada consulta debe traer para normalizeItems.
const ITEM_COLUMNS = {
  articles: "id, type, title, body, project_id, created_at",
  sources:
    "id, claim, verdict, verdict_label, confidence_level, explanation, evidence_found, sources_used, what_to_verify, project_id, created_at",
  transcriptions: "id, transcript_text, project_id, created_at",
  sessions: "id, title, project_id, created_at, messages(role, content)",
  documents: "id, file_name, file_type, analysis_types, results, project_id, created_at",
  interviews: "id, interviewee, topic, results, project_id, created_at",
};

function normalizeItems({ articles = [], sources = [], transcriptions = [], sessions = [], documents = [], interviews = [] }) {
  const items = [
    ...articles.map((a) => ({
      id: a.id,
      type: "article",
      article_type: a.type,
      title: a.title,
      subtitle: truncate(a.body),
      project_id: a.project_id,
      created_at: a.created_at,
      detail: { id: a.id, type: a.type, title: a.title, body: a.body },
    })),
    ...sources.map((s) => ({
      id: s.id,
      type: "source",
      title: s.claim,
      subtitle: `${s.verdict_label || s.verdict} — ${truncate(s.explanation)}`,
      project_id: s.project_id,
      created_at: s.created_at,
      detail: {
        claim: s.claim,
        verdict: s.verdict,
        verdict_label: s.verdict_label,
        confidence_level: s.confidence_level,
        explanation: s.explanation,
        evidence_found: s.evidence_found,
        sources_used: s.sources_used || [],
        what_to_verify: s.what_to_verify,
      },
    })),
    ...transcriptions.map((t) => ({
      id: t.id,
      type: "transcription",
      title: "Transcripción de audio",
      subtitle: truncate(t.transcript_text),
      project_id: t.project_id,
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
        project_id: s.project_id,
        created_at: s.created_at,
        detail: { idea: idea || s.title, plan },
      };
    }),
    ...documents.map((d) => ({
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
    ...interviews.map((i) => ({
      id: i.id,
      type: "interview",
      title: `Entrevista a ${i.interviewee}`,
      subtitle: truncate(i.topic),
      project_id: i.project_id,
      created_at: i.created_at,
      detail: { interviewee: i.interviewee, topic: i.topic, results: i.results },
    })),
  ];

  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return items;
}

module.exports = { ITEM_COLUMNS, normalizeItems, truncate };
