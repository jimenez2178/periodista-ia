"use client";

import { useState } from "react";
import Button from "../ui/Button";

const MAX_INSTRUCTION_LENGTH = 1000;

export default function PlanRefiner({ selectedAngle, onRefine, disabled }) {
  const [instruction, setInstruction] = useState("");
  const canRefine = !disabled && (!!selectedAngle || !!instruction.trim());

  async function handleRefine() {
    const refined = await onRefine(instruction.trim());
    if (refined) setInstruction("");
  }

  return (
    <div className="flex flex-col gap-3 rounded-brand border border-brand-border bg-white p-4">
      <h3 className="font-semibold text-brand-text">🔧 Ajustar el plan</h3>
      {selectedAngle && (
        <p className="text-sm text-brand-text/80">
          <span className="font-medium">Ángulo elegido:</span> {selectedAngle}
        </p>
      )}
      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        disabled={disabled}
        maxLength={MAX_INSTRUCTION_LENGTH}
        rows={2}
        aria-label="Qué quieres ajustar del plan"
        placeholder="Ej: Enfócalo en los barrios del norte de la ciudad y agrega más fuentes documentales"
        className="rounded-brand border border-brand-border px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-blue disabled:bg-brand-bg disabled:text-brand-text/50"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-brand-text/50">
          {selectedAngle ? "El plan se reenfocará en el ángulo elegido." : "Elige un ángulo arriba o escribe qué ajustar."}
        </p>
        <Button onClick={handleRefine} disabled={!canRefine} variant="secondary" className="w-full sm:w-auto">
          Actualizar plan
        </Button>
      </div>
    </div>
  );
}
