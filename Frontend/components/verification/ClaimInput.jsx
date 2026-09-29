"use client";

import Button from "../ui/Button";

const MAX_LENGTH = 1000;
const MAX_CONTEXT_LENGTH = 1000;

export default function ClaimInput({ value, onChange, context, onContextChange, onSubmit, disabled }) {
  const isEmpty = value.trim().length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={MAX_LENGTH}
          rows={4}
          aria-label="Afirmación a verificar"
          placeholder="Escribe la afirmación que quieres verificar. Ej: El presidente firmó el decreto 45-2026 el pasado lunes"
          className="rounded-brand border border-brand-border px-4 py-3 text-brand-text outline-none focus:border-brand-blue disabled:bg-brand-bg disabled:text-brand-text/50"
        />
        <span className="text-xs text-brand-text/50">
          {value.length}/{MAX_LENGTH}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="claim_context" className="text-sm font-semibold text-brand-text">
          📌 ¿Quién lo dijo, dónde y cuándo? <span className="font-normal text-brand-text/50">(opcional)</span>
        </label>
        <textarea
          id="claim_context"
          value={context}
          onChange={(e) => onContextChange(e.target.value)}
          disabled={disabled}
          maxLength={MAX_CONTEXT_LENGTH}
          rows={2}
          placeholder="Ej: Lo dijo el ministro de Hacienda en una entrevista radial el 25 de septiembre."
          className="rounded-brand border border-brand-border px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-blue disabled:bg-brand-bg disabled:text-brand-text/50"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={disabled || isEmpty} className="w-full sm:w-auto">
          Verificar
        </Button>
      </div>
    </div>
  );
}
