// Tope del texto de un documento que se manda a la IA. Con 25 MB un PDF puede
// traer muchisimo texto: sin tope seria lento, caro o pasaria el limite de la IA.
// ~150.000 caracteres son unas 50 paginas de texto corrido.
const MAX_DOCUMENT_TEXT_CHARS = 150000;
const APPROX_CHARS_PER_PAGE = 3000;

function capDocumentText(text) {
  if (text.length <= MAX_DOCUMENT_TEXT_CHARS) return { text, warning: null };

  const pages = Math.round(MAX_DOCUMENT_TEXT_CHARS / APPROX_CHARS_PER_PAGE);
  return {
    text: text.slice(0, MAX_DOCUMENT_TEXT_CHARS),
    warning: `El documento es muy largo: se usaron solo sus primeras ${pages} páginas aproximadamente (${MAX_DOCUMENT_TEXT_CHARS.toLocaleString("es")} caracteres). Lo que viene después no se tuvo en cuenta.`,
  };
}

module.exports = { MAX_DOCUMENT_TEXT_CHARS, capDocumentText };
