const NEWS_ARTICLE_BASE = `Eres el copiloto editorial de PeriodistaIA. A partir del texto extraído de un
documento (informe, comunicado, transcripción, etc.) que te comparte un periodista,
escribe una nota periodística lista para publicar: título de impacto pero preciso,
lead que resuma el hecho central, y cuerpo estructurado en pirámide invertida (la
información más relevante primero), sintetizando declaraciones si las hay.`;

function buildPressReleaseBase(organizationName) {
  return `Eres el copiloto editorial de PeriodistaIA. A partir del texto extraído de un
documento que te comparte un comunicador, escribe un comunicado de prensa en nombre
de "${organizationName}": titular claro, lead, cuerpo con tono institucional apropiado
para un comunicado oficial, y una sección final de boilerplate con los datos de la
organización si el documento los provee (o una línea de cierre genérica si no).`;
}

const TONE_LINES = {
  Informativo: "Usa un tono informativo y neutral.",
  Institucional: "Usa un tono institucional y corporativo.",
  Ejecutivo: "Usa un tono ejecutivo, directo y orientado a resultados.",
};

const LENGTH_LINES = {
  "Breve (1-2 párrafos)": "La nota debe ser breve: 1 a 2 párrafos en total.",
  Completa: "Desarrolla la nota de forma completa, con varios párrafos bien estructurados.",
};

const ANGLE_LINE = `El periodista indica la historia que quiere desarrollar a partir del documento: enfoca
la nota en ella (título y lead incluidos) y usa del documento solo lo que la sustenta.`;

// La tabla `articles` restringe `type` a estos dos slugs; los formularios manejan
// las etiquetas con emoji.
const ARTICLE_TYPE_BY_FORMAT = {
  "📰 Nota periodística": "news_article",
  "📋 Comunicado de prensa": "press_release",
};
const VALID_FORMATS = Object.keys(ARTICLE_TYPE_BY_FORMAT);

function buildSystemPrompt({ format, tone, length, organizationName, hasAngle = false }) {
  const base =
    format === "📋 Comunicado de prensa" ? buildPressReleaseBase(organizationName) : NEWS_ARTICLE_BASE;
  const toneLine = TONE_LINES[tone] || "";
  const lengthLine = LENGTH_LINES[length] || "";

  return `${base}
${toneLine}
${lengthLine}
${hasAngle ? ANGLE_LINE : ""}
No inventes información que no esté en el documento.
Responde siempre en el mismo idioma del documento.`;
}

module.exports = { buildSystemPrompt, ARTICLE_TYPE_BY_FORMAT, VALID_FORMATS };
