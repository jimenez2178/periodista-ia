import Card from "../ui/Card";
import Button from "../ui/Button";
import { ANALYSIS_TYPES } from "../../utils/documentAnalysisTypes";

function findMeta(slug) {
  return ANALYSIS_TYPES.find((t) => t.slug === slug) || { emoji: "📄", label: slug };
}

export default function DocumentResults({ analysisTypes, results, onReset, onSaveToProject }) {
  return (
    <div className="flex flex-col gap-4">
      {(analysisTypes || []).map((slug) => {
        const { emoji, label } = findMeta(slug);

        if (slug === "executive_summary") {
          return (
            <details key={slug} open className="rounded-brand border border-brand-border bg-white p-4">
              <summary className="cursor-pointer text-base font-semibold text-brand-text">
                {emoji} {label}
              </summary>
              <p className="mt-3 text-sm text-brand-text/80">
                {results.executive_summary || "No se encontró un resumen para este documento."}
              </p>
            </details>
          );
        }

        if (slug === "story_angles") {
          const stories = results.story_angles || [];
          return (
            <details key={slug} open className="rounded-brand border border-brand-border bg-white p-4">
              <summary className="cursor-pointer text-base font-semibold text-brand-text">
                {emoji} {label}
              </summary>
              {stories.length === 0 ? (
                <p className="mt-3 text-sm text-brand-text/70">No se encontraron posibles historias.</p>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {stories.map((story, index) => (
                    <Card key={index} variant="elevated" className="flex flex-col gap-1">
                      <h4 className="font-bold text-brand-text">{story.title}</h4>
                      <p className="text-sm text-brand-text/70">{story.description}</p>
                    </Card>
                  ))}
                </div>
              )}
            </details>
          );
        }

        const findings = results[slug] || [];
        return (
          <details key={slug} open className="rounded-brand border border-brand-border bg-white p-4">
            <summary className="cursor-pointer text-base font-semibold text-brand-text">
              {emoji} {label}
            </summary>
            {findings.length === 0 ? (
              <p className="mt-3 text-sm text-brand-text/70">No se encontraron hallazgos de este tipo.</p>
            ) : (
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-brand-text/80">
                {findings.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </details>
        );
      })}

      {(onReset || onSaveToProject) && (
        <div className="flex flex-col gap-3 border-t border-brand-border pt-4 sm:flex-row">
          {onReset && (
            <Button variant="secondary" onClick={onReset} className="w-full sm:w-auto">
              Nuevo análisis
            </Button>
          )}
          {onSaveToProject && (
            <Button onClick={onSaveToProject} className="w-full sm:w-auto">
              Guardar en proyecto →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
