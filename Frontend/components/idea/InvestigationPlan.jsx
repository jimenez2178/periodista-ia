const SECTIONS = [
  { key: "angle_suggestions", icon: "📌", title: "Ángulos posibles" },
  { key: "key_questions", icon: "❓", title: "Preguntas clave" },
  { key: "sources_to_check", icon: "📞", title: "Fuentes a consultar" },
  { key: "investigation_steps", icon: "📋", title: "Pasos de investigación" },
  { key: "potential_challenges", icon: "⚠️", title: "Posibles obstáculos" },
];

export default function InvestigationPlan({ plan }) {
  return (
    <div className="flex flex-col gap-3">
      {SECTIONS.map(({ key, icon, title }) => (
        <details key={key} open className="rounded-brand border border-brand-border bg-white p-4">
          <summary className="cursor-pointer text-base font-semibold text-brand-text">
            {icon} {title}
          </summary>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-brand-text/80">
            {(plan[key] || []).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
