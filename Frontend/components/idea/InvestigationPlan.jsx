"use client";

// Secciones de lista del plan. Las marcadas como nuevas no existen en planes
// generados antes de esta versión; si faltan, simplemente no se muestran.
const SECTIONS = [
  { key: "key_questions", icon: "❓", title: "Preguntas clave" },
  { key: "sources_to_check", icon: "📞", title: "Fuentes a consultar" },
  { key: "documents_to_request", icon: "🗂️", title: "Documentos y datos a pedir" },
  { key: "investigation_steps", icon: "📋", title: "Pasos de investigación" },
  { key: "potential_challenges", icon: "⚠️", title: "Obstáculos y riesgos" },
  { key: "kill_criteria", icon: "🛑", title: "Qué haría caer la historia" },
];

function ActionLink({ onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="ml-2 whitespace-nowrap text-xs font-medium text-brand-blue hover:underline disabled:opacity-50"
    >
      {children}
    </button>
  );
}

// Sin los callbacks, el plan se muestra solo para leer (ej. en el historial).
export default function InvestigationPlan({
  plan,
  selectedAngle,
  onSelectAngle,
  onToggleStep,
  onPrepareInterview,
  onAnalyzeDocument,
  disabled,
}) {
  const completedSteps = plan.completed_steps || [];
  const angles = plan.angle_suggestions || [];
  const steps = plan.investigation_steps || [];

  return (
    <div className="flex flex-col gap-3">
      {(plan.hypothesis || plan.estimated_time) && (
        <div className="rounded-brand border border-brand-yellow bg-brand-yellow/10 p-4">
          {plan.hypothesis && (
            <>
              <h3 className="mb-1 font-semibold text-brand-text">🎯 Hipótesis</h3>
              <p className="text-sm text-brand-text/80">{plan.hypothesis}</p>
            </>
          )}
          {plan.estimated_time && (
            <p className="mt-2 text-xs text-brand-text/60">⏱️ Tiempo estimado: {plan.estimated_time}</p>
          )}
        </div>
      )}

      <details open className="rounded-brand border border-brand-border bg-white p-4">
        <summary className="cursor-pointer text-base font-semibold text-brand-text">📌 Ángulos posibles</summary>
        {onSelectAngle ? (
          <fieldset className="mt-3 flex flex-col gap-2" disabled={disabled}>
            <p className="text-xs text-brand-text/60">
              Elige un ángulo para enfocar el plan y los textos que produzcas.
            </p>
            {angles.map((angle, index) => (
              <label
                key={index}
                htmlFor={`plan-angle-${index}`}
                className="flex cursor-pointer items-start gap-2 rounded-brand border border-brand-border px-3 py-2 text-sm text-brand-text/80 transition-colors hover:border-brand-blue has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5"
              >
                <input
                  id={`plan-angle-${index}`}
                  type="radio"
                  name="plan_angle"
                  checked={selectedAngle === angle}
                  onChange={() => onSelectAngle(angle)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue"
                />
                {angle}
              </label>
            ))}
            {selectedAngle && (
              <button
                type="button"
                onClick={() => onSelectAngle("")}
                className="self-start text-xs font-medium text-brand-blue hover:underline"
              >
                Quitar selección
              </button>
            )}
          </fieldset>
        ) : (
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-brand-text/80">
            {angles.map((angle, index) => (
              <li key={index}>{angle}</li>
            ))}
          </ul>
        )}
      </details>

      {SECTIONS.map(({ key, icon, title }) => {
        const items = plan[key];
        if (!items?.length) return null;

        if (key === "investigation_steps" && onToggleStep) {
          const doneCount = steps.filter((_, index) => completedSteps.includes(index)).length;
          return (
            <details key={key} open className="rounded-brand border border-brand-border bg-white p-4">
              <summary className="cursor-pointer text-base font-semibold text-brand-text">
                {icon} {title}{" "}
                <span className="text-sm font-normal text-brand-text/60">
                  ({doneCount}/{steps.length} hechos)
                </span>
              </summary>
              <div className="mt-3 flex flex-col gap-2">
                {steps.map((step, index) => (
                  <label
                    key={index}
                    htmlFor={`plan-step-${index}`}
                    className="flex cursor-pointer items-start gap-2 text-sm text-brand-text/80 has-[:checked]:text-brand-text/50 has-[:checked]:line-through"
                  >
                    <input
                      id={`plan-step-${index}`}
                      type="checkbox"
                      checked={completedSteps.includes(index)}
                      onChange={() => onToggleStep(index)}
                      disabled={disabled}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue"
                    />
                    {step}
                  </label>
                ))}
              </div>
            </details>
          );
        }

        return (
          <details key={key} open className="rounded-brand border border-brand-border bg-white p-4">
            <summary className="cursor-pointer text-base font-semibold text-brand-text">
              {icon} {title}
            </summary>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-brand-text/80">
              {items.map((item, index) => (
                <li key={index}>
                  {item}
                  {key === "sources_to_check" && onPrepareInterview && (
                    <ActionLink onClick={() => onPrepareInterview(item)} disabled={disabled}>
                      🗣️ Preparar entrevista
                    </ActionLink>
                  )}
                  {key === "documents_to_request" && onAnalyzeDocument && (
                    <ActionLink onClick={onAnalyzeDocument} disabled={disabled}>
                      📄 Ya lo tengo: analizar
                    </ActionLink>
                  )}
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}
