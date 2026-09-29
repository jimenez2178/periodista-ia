const anthropic = require("../config/anthropic");

// La versión básica (sin filtrado dinámico) llega a resultados equivalentes en
// ~30 s; web_search_20260209 tardaba 60-130 s por consulta. No usamos
// user_location: la API rechaza varios países de nuestros usuarios (ej. "DO"),
// así que el país va en el prompt.
const WEB_SEARCH_TOOL_TYPE = "web_search_20250305";
const MAX_PAUSE_CONTINUATIONS = 2;

function normalizeUrl(url) {
  return url.trim().replace(/\/+$/, "").toLowerCase();
}

// Enlaces que la búsqueda devolvió de verdad. Un error de la herramienta llega como
// objeto (no como lista) dentro de un 200, así que solo leemos las listas.
function collectSearchResultUrls(content) {
  const urls = new Set();
  for (const block of content) {
    if (block.type !== "web_search_tool_result" || !Array.isArray(block.content)) continue;
    for (const result of block.content) {
      if (result.url) urls.add(normalizeUrl(result.url));
    }
  }
  return urls;
}

// messages.parse con búsqueda web: reanuda los turnos pausados por el bucle de
// búsqueda del servidor y devuelve la salida estructurada junto con las URLs que
// la búsqueda devolvió realmente.
async function parseWithWebSearch({ maxSearches, messages, ...params }) {
  const tool = { type: WEB_SEARCH_TOOL_TYPE, name: "web_search", max_uses: maxSearches };
  const conversation = [...messages];
  const allContent = [];
  let response;

  for (let attempt = 0; attempt <= MAX_PAUSE_CONTINUATIONS; attempt++) {
    response = await anthropic.messages.parse({ ...params, tools: [tool], messages: conversation });
    allContent.push(...response.content);

    // Se reanuda devolviendo el turno del asistente tal cual, sin mensaje extra.
    if (response.stop_reason !== "pause_turn") break;
    conversation.push({ role: "assistant", content: response.content });
  }

  return { parsed: response.parsed_output, searchUrls: collectSearchResultUrls(allContent) };
}

// Red de seguridad: una URL que no vino de la búsqueda se quita (queda el nombre).
function keepOnlySearchedUrl(source, searchUrls) {
  return source.url && !searchUrls.has(normalizeUrl(source.url)) ? { ...source, url: null } : source;
}

module.exports = { parseWithWebSearch, keepOnlySearchedUrl };
