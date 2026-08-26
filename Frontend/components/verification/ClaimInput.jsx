"use client";

import Button from "../ui/Button";

const MAX_LENGTH = 1000;

export default function ClaimInput({ value, onChange, onSubmit, disabled }) {
  const isEmpty = value.trim().length === 0;

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={MAX_LENGTH}
        rows={5}
        placeholder="Escribe la afirmación que quieres verificar. Ej: El presidente firmó el decreto 45-2026 el pasado lunes"
        className="rounded-brand border border-brand-border px-4 py-3 text-brand-text outline-none focus:border-brand-blue disabled:bg-brand-bg disabled:text-brand-text/50"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-brand-text/50">
          {value.length}/{MAX_LENGTH}
        </span>
        <Button onClick={onSubmit} disabled={disabled || isEmpty}>
          Verificar
        </Button>
      </div>
    </div>
  );
}
