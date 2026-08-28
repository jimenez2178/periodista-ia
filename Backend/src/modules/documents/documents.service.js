const { z } = require("zod");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");
const anthropic = require("../../config/anthropic");
const { supabaseAdmin } = require("../../config/supabase");

const ANALYSIS_TYPE_DEFS = {
  key_data_points: {
    emoji: "📊",
    label: "Datos y cifras importantes",
    guidance:
      "Extrae cifras, estadísticas y datos concretos mencionados en el documento, citando el número exacto y el contexto al que pertenece.",
    shape: () => z.array(z.string()),
  },
  budget_and_finances: {
    emoji: "💰",
    label: "Dinero y presupuestos",
    guidance:
      "Extrae montos, presupuestos, costos o cifras financieras mencionadas, indicando el monto exacto y a qué corresponde.",
    shape: () => z.array(z.string()),
  },
  people_and_institutions: {
    emoji: "👤",
    label: "Personas e instituciones mencionadas",
    guidance:
      "Lista personas e instituciones mencionadas en el documento, indicando su rol o relevancia dentro del texto.",
    shape: () => z.array(z.string()),
  },
  dates_and_timeline: {
    emoji: "📅",
    label: "Fechas y cronología",
    guidance:
      "Extrae fechas y eventos relevantes, ordenados cronológicamente cuando sea posible, indicando qué ocurrió en cada una.",
    shape: () => z.array(z.string()),
  },
  contradictions: {
    emoji: "⚠️",
    label: "Contradicciones o inconsistencias",
    guidance:
      "Señala afirmaciones contradictorias, inconsistencias numéricas o declaraciones que se contradicen entre sí dentro del documento.",
    shape: () => z.array(z.string()),
  },
  story_angles: {
    emoji: "💡",
    label: "Posibles historias periodísticas",
    guidance:
      "Sugiere posibles historias periodísticas a partir del contenido, cada una con un título llamativo y una descripción de 1-2 oraciones explicando por qué es noticiable.",
    shape: () => z.array(z.object({ title: z.string(), description: z.string() })),
  },
  executive_summary: {
    emoji: "📋",
    label: "Resumen ejecutivo",
    guidance: "Escribe un resumen ejecutivo de 3 a 5 oraciones con lo más importante del documento.",
    shape: () => z.string(),
  },
};

const ANALYSIS_TYPE_SLUGS = Object.keys(ANALYSIS_TYPE_DEFS);

function buildResultSchema(selectedTypes) {
  const shape = {};
  for (const type of selectedTypes) {
    shape[type] = ANALYSIS_TYPE_DEFS[type].shape();
  }
  return z.object(shape);
}

function buildSystemPrompt(selectedTypes) {
  const guidanceLines = selectedTypes.map((type) => `- ${ANALYSIS_TYPE_DEFS[type].label}: ${ANALYSIS_TYPE_DEFS[type].guidance}`);

  return `Eres el copiloto editorial de PeriodistaIA. Un periodista te da el texto extraído de un
documento (PDF, Word, Excel o CSV) y una lista de tipos de análisis a realizar.
Responde ÚNICAMENTE con las claves solicitadas a continuación, basándote en hechos
concretos presentes en el texto (cifras, nombres, fechas reales) — no inventes ni
generalices. Si no encuentras nada relevante para una clave, devuelve un array vacío
(o un texto indicándolo para el resumen ejecutivo) en vez de fabricar contenido.
Responde siempre en español.

Tipos de análisis solicitados:
${guidanceLines.join("\n")}`;
}

async function generateDocumentAnalysis({ text, analysisTypes }) {
  const response = await anthropic.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(buildResultSchema(analysisTypes)),
    },
    system: buildSystemPrompt(analysisTypes),
    messages: [{ role: "user", content: text }],
  });

  return response.parsed_output;
}

async function extractText(buffer, originalname) {
  const extension = (originalname.split(".").pop() || "").toLowerCase();

  if (extension === "pdf") {
    const { PDFParse } = require("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return { text: result.text, pageCount: result.total, fileType: "pdf" };
    } finally {
      await parser.destroy();
    }
  }

  if (extension === "docx") {
    const mammoth = require("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    return { text: value, pageCount: null, fileType: "docx" };
  }

  if (extension === "xlsx") {
    const XLSX = require("xlsx");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const text = workbook.SheetNames.map(
      (name) => `## Hoja: ${name}\n${XLSX.utils.sheet_to_csv(workbook.Sheets[name])}`
    ).join("\n\n");
    return { text, pageCount: null, fileType: "xlsx" };
  }

  if (extension === "csv") {
    return { text: buffer.toString("utf8"), pageCount: null, fileType: "csv" };
  }

  if (extension === "txt") {
    return { text: buffer.toString("utf8"), pageCount: null, fileType: "txt" };
  }

  throw Object.assign(new Error("Formato no compatible. Sube un PDF, Word (.docx), Excel (.xlsx) o CSV."), {
    status: 400,
  });
}

async function saveDocument({ userId, fileName, fileType, fileSizeBytes, analysisTypes, results }) {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .insert({
      user_id: userId,
      file_name: fileName,
      file_type: fileType,
      file_size_bytes: fileSizeBytes,
      analysis_types: analysisTypes,
      results,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  ANALYSIS_TYPE_DEFS,
  ANALYSIS_TYPE_SLUGS,
  extractText,
  generateDocumentAnalysis,
  saveDocument,
};
