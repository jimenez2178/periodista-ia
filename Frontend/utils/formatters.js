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
  article: { emoji: "🎙️", label: "Nota" },
  transcription: { emoji: "🎙️", label: "Transcripción" },
  source: { emoji: "🔍", label: "Verificación" },
  idea: { emoji: "💡", label: "Idea" },
};

export function getItemTypeMeta(type) {
  return ITEM_TYPE_META[type] || { emoji: "📄", label: "Elemento" };
}
