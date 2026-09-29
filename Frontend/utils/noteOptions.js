// Opciones para redactar una nota desde un documento ("De documento a nota" y
// "Analizar documento"). Las etiquetas viajan tal cual al backend.
export const NEWS_FORMAT = "📰 Nota periodística";
export const PRESS_RELEASE_FORMAT = "📋 Comunicado de prensa";
export const FORMAT_OPTIONS = [NEWS_FORMAT, PRESS_RELEASE_FORMAT];

// Cada formato tiene sus tonos: una nota no se escribe en tono "institucional".
export const TONE_OPTIONS_BY_FORMAT = {
  [NEWS_FORMAT]: ["Informativo", "Interpretativo"],
  [PRESS_RELEASE_FORMAT]: ["Institucional", "Cercano"],
};

export const LENGTH_OPTIONS = ["Breve (1-2 párrafos)", "Completa"];
