const SECTIONS = [
  { key: "basic_questions", icon: "🎯", title: "Preguntas básicas" },
  { key: "hard_questions", icon: "🔥", title: "Preguntas incómodas" },
  { key: "follow_up_questions", icon: "🔄", title: "Preguntas de seguimiento" },
  { key: "topics_to_avoid", icon: "💡", title: "Temas que probablemente evitará" },
  { key: "facts_to_verify", icon: "📋", title: "Datos que deberías verificar antes" },
];

export default function InterviewResults({ results }) {
  return (
    <div className="flex flex-col gap-3">
      {SECTIONS.map(({ key, icon, title }) => (
        <details key={key} open className="rounded-brand border border-brand-border bg-white p-4">
          <summary className="cursor-pointer text-base font-semibold text-brand-text">
            {icon} {title}
          </summary>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-brand-text/80">
            {(results[key] || []).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
