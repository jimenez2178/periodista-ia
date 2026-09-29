// Funciones de PeriodistaIA para las tarjetas del inicio y los enlaces del
// recomendador de flujos. Los slugs deben coincidir con
// Backend/src/utils/featureCatalog.js (el recomendador devuelve estos slugs).
export const FEATURES = [
  {
    slug: "transcription",
    href: "/transcription",
    emoji: "🎙️",
    title: "De entrevista a noticia",
    description: "Transcribe tu entrevista y genera tu nota en segundos",
  },
  {
    slug: "idea",
    href: "/idea",
    emoji: "💡",
    title: "Tengo una idea",
    description: "Convierte una observación en un plan de investigación y produce tu pitch o tu nota",
  },
  {
    slug: "verification",
    href: "/verification",
    emoji: "🔍",
    title: "Verificar fuentes",
    description: "Confirma si una afirmación tiene respaldo real, con búsqueda en internet y fuentes",
  },
  {
    slug: "documents",
    href: "/documents",
    emoji: "📄",
    title: "Analizar documento",
    description: "Sube un PDF, Word o Excel, obtén hallazgos clave y redacta tu nota a partir de ellos",
  },
  {
    slug: "interview",
    href: "/interview",
    emoji: "🗣️",
    title: "Preparar entrevista",
    description: "Investiga al entrevistado y recibe un guion de preguntas para tu próxima entrevista",
  },
  {
    slug: "tools",
    href: "/tools",
    emoji: "🧭",
    title: "¿Qué herramienta necesito?",
    description: "Describe tu tarea y recibe un flujo de trabajo paso a paso",
  },
  {
    slug: "doc-to-note",
    href: "/doc-to-note",
    emoji: "📝",
    title: "De documento a nota",
    description: "Sube un documento y conviértelo directo en una nota lista para publicar",
  },
  {
    slug: "projects",
    href: "/projects",
    emoji: "📁",
    title: "Proyectos",
    description: "Organiza y retoma tu trabajo por historia",
    showOnHome: false,
  },
];

export function getFeature(slug) {
  return FEATURES.find((feature) => feature.slug === slug) || null;
}
