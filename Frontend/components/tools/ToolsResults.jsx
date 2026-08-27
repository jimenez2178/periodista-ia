import Card from "../ui/Card";

export default function ToolsResults({ recommendation }) {
  const { steps, periodista_ia_role, copilot_tip } = recommendation;

  return (
    <div className="flex flex-col gap-4">
      <details open className="rounded-brand border border-brand-border bg-white p-4">
        <summary className="cursor-pointer text-base font-semibold text-brand-text">
          🗺️ Flujo recomendado paso a paso
        </summary>
        <ol className="mt-3 flex flex-col gap-4">
          {[...(steps || [])]
            .sort((a, b) => a.order - b.order)
            .map((step) => (
              <li key={step.order} className="flex flex-col gap-2">
                <p className="font-medium text-brand-text">
                  {step.order}. {step.step}
                </p>
                <div className="flex flex-wrap gap-2 pl-5">
                  {(step.tools || []).map((tool, index) => (
                    <span
                      key={index}
                      className="rounded-brand bg-brand-bg px-3 py-1 text-xs font-medium text-brand-text/80"
                    >
                      🛠️ {tool}
                    </span>
                  ))}
                </div>
              </li>
            ))}
        </ol>
      </details>

      <Card className="flex flex-col gap-2 !bg-brand-blue text-white">
        <h3 className="font-bold">⭐ Qué puede hacer PeriodistaIA en este flujo</h3>
        <p className="text-sm text-white/90">{periodista_ia_role}</p>
      </Card>

      <details open className="rounded-brand border border-brand-border bg-white p-4">
        <summary className="cursor-pointer text-base font-semibold text-brand-text">
          💡 Consejo del copiloto
        </summary>
        <p className="mt-3 text-sm text-brand-text/80">{copilot_tip}</p>
      </details>
    </div>
  );
}
