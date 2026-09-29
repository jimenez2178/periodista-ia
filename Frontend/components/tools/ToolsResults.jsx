"use client";

import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { getFeature } from "../../utils/features";

function buildCopyText({ task, steps, periodista_ia_role, copilot_tip }) {
  const lines = [];
  if (task) lines.push(`Tarea: ${task}`, "");
  lines.push("Flujo recomendado:");
  for (const step of steps) {
    const feature = getFeature(step.feature);
    const tools = [...(feature ? [`PeriodistaIA: ${feature.title}`] : []), ...(step.tools || [])];
    lines.push(`${step.order}. ${step.step}${tools.length ? ` (${tools.join(", ")})` : ""}`);
  }
  lines.push("", `PeriodistaIA en este flujo: ${periodista_ia_role}`, "", `Consejo: ${copilot_tip}`);
  return lines.join("\n");
}

export default function ToolsResults({ task, recommendation, onOpenFeature }) {
  const [copied, setCopied] = useState(false);
  const { periodista_ia_role, copilot_tip } = recommendation;
  const steps = [...(recommendation.steps || [])].sort((a, b) => a.order - b.order);

  async function handleCopy() {
    await navigator.clipboard.writeText(buildCopyText({ task, steps, periodista_ia_role, copilot_tip }));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <details open className="rounded-brand border border-brand-border bg-white p-4">
        <summary className="cursor-pointer text-base font-semibold text-brand-text">
          🗺️ Flujo recomendado paso a paso
        </summary>
        <ol className="mt-3 flex flex-col gap-4">
          {steps.map((step) => {
            const feature = getFeature(step.feature);
            return (
              <li key={step.order} className="flex flex-col gap-2">
                <p className="font-medium text-brand-text">
                  {step.order}. {step.step}
                </p>
                <div className="flex flex-wrap items-center gap-2 pl-5">
                  {feature && (
                    <button
                      type="button"
                      onClick={() => onOpenFeature(feature)}
                      className="rounded-brand bg-brand-blue px-3 py-1 text-xs font-semibold text-white hover:bg-brand-blue/90"
                    >
                      {feature.emoji} Hacerlo en PeriodistaIA: {feature.title} →
                    </button>
                  )}
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
            );
          })}
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

      <div>
        <Button variant="secondary" onClick={handleCopy}>
          📋 {copied ? "¡Copiado!" : "Copiar flujo"}
        </Button>
      </div>
    </div>
  );
}
