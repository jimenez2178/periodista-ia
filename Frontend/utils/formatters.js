export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

const ITEM_TYPE_META = {
  article: { emoji: "📰", label: "Nota" },
  transcription: { emoji: "🎤", label: "Transcripción" },
  source: { emoji: "🔍", label: "Verificación" },
  idea: { emoji: "💡", label: "Idea" },
  document: { emoji: "📄", label: "Documento" },
  interview: { emoji: "🎙️", label: "Entrevista" },
};

export function getItemTypeMeta(type) {
  return ITEM_TYPE_META[type] || { emoji: "📄", label: "Elemento" };
}

export function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Hace un momento";
  if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes === 1 ? "" : "s"}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours === 1 ? "" : "s"}`;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const calendarDaysAgo = Math.round((startOfToday - startOfDate) / 86400000);

  if (calendarDaysAgo === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays === 1 ? "" : "s"}`;

  return date.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}
