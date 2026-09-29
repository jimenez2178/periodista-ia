// Catálogo único de funciones de PeriodistaIA. Lo usan el recomendador de flujos
// ("¿Qué herramienta necesito?") y el asistente de ayuda: al agregar o cambiar una
// función, actualizarla aquí para que ninguno de los dos quede desactualizado.
// Los slugs deben coincidir con Frontend/utils/features.js.
const FEATURES = [
  {
    slug: "transcription",
    name: "De entrevista a noticia",
    summary:
      "transcribe un audio (archivo o enlace de WhatsApp/Drive), analiza participantes, citas y ángulos, y redacta una nota periodística o nota de prensa eligiendo ángulo, citas y contexto.",
    howTo:
      "Sube el audio o pega un enlace y pulsa Transcribir. Revisa el análisis, marca las citas que quieres, corrige la transcripción si hace falta, elige el ángulo y agrega contexto; luego genera la nota periodística o de prensa. Plan gratuito: audios de hasta 2 minutos.",
  },
  {
    slug: "idea",
    name: "Tengo una idea",
    summary:
      "convierte una idea en un plan de investigación (hipótesis, ángulos, fuentes, documentos a pedir, pasos, riesgos), que se puede ajustar, y produce un pitch al editor, un esqueleto de nota con datos pendientes o una nota con los hallazgos del reporteo.",
    howTo:
      "Escribe tu idea y pulsa Generar plan. Elige un ángulo y usa Ajustar el plan si quieres reenfocarlo. Marca los pasos que vas completando. Desde cada fuente puedes ir a Preparar entrevista. Abajo eliges qué producir: pitch, esqueleto de nota o nota con tu reporteo (pegando tus hallazgos).",
  },
  {
    slug: "verification",
    name: "Verificar fuentes",
    summary:
      "verifica una afirmación buscando en internet y devuelve veredicto, evidencia, fuentes con enlaces y qué falta confirmar.",
    howTo:
      "Escribe la afirmación y, si puedes, quién la dijo, dónde y cuándo. Pulsa Verificar (tarda hasta un minuto porque busca en internet). Puedes copiar la verificación completa.",
  },
  {
    slug: "documents",
    name: "Analizar documento",
    summary:
      "analiza un PDF, Word, Excel o CSV: resumen, datos y cifras, dinero, personas, fechas, contradicciones y posibles historias; desde ahí se verifica cada hallazgo o se redacta una nota sobre una historia.",
    howTo:
      "Sube el archivo, elige qué analizar y pulsa Analizar documento. En los resultados: cada dato o cifra tiene un botón Verificar; cada posible historia tiene Redactar nota e Investigar; y abajo hay un botón general Redactar nota sobre todo el documento. Plan gratuito: hasta 5 páginas o 500KB.",
  },
  {
    slug: "doc-to-note",
    name: "De documento a nota",
    summary:
      "convierte directamente un documento o un texto pegado (comunicado, informe) en una nota periodística o comunicado, con tono, extensión y enfoque a elegir.",
    howTo:
      "Sube un PDF, Word o TXT, o pega el texto. Elige formato, tono, extensión y, si quieres, el enfoque. Pulsa Generar nota; con Generar otra versión cambias las opciones sin volver a subir el archivo.",
  },
  {
    slug: "interview",
    name: "Preparar entrevista",
    summary:
      "prepara una entrevista: investiga al entrevistado en internet y genera preguntas básicas, incómodas y repreguntas según el objetivo y el tipo de entrevista, con un guion descargable.",
    howTo:
      "Indica a quién entrevistas, el tema, qué quieres conseguir y el tipo (breve, a fondo o en vivo). Deja marcada la opción de investigar en internet para preguntas con datos reales. Descarga el guion en PDF o Word.",
  },
  {
    slug: "projects",
    name: "Proyectos",
    summary:
      "organiza por historia todo lo generado (ideas, análisis, notas, verificaciones, entrevistas) y permite retomarlo con Abrir y continuar.",
    howTo:
      "Crea un proyecto y guarda en él tus resultados con Guardar en proyecto. Dentro del proyecto puedes filtrar por tipo, editar notas, quitar elementos y usar Abrir y continuar para seguir trabajando. Si sales de una sección sin guardar, la app te avisa y te ofrece guardar y continuar.",
  },
];

const FEATURE_SLUGS = FEATURES.map((feature) => feature.slug);

function describeFeatures() {
  return FEATURES.map((f) => `- ${f.name} [${f.slug}]: ${f.summary}`).join("\n");
}

function describeHowTo() {
  return FEATURES.map((f) => `- ${f.name}: ${f.howTo}`).join("\n");
}

module.exports = { FEATURES, FEATURE_SLUGS, describeFeatures, describeHowTo };
