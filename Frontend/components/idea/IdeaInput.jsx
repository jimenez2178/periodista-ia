"use client";

import Button from "../ui/Button";

const MAX_LENGTH = 2000;

export default function IdeaInput({ value, onChange, onSubmit, disabled }) {
  const isEmpty = value.trim().length === 0;

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={MAX_LENGTH}
        rows={6}
        placeholder="Cuéntame tu idea con tus palabras. Puede ser una observación, una sospecha, algo que viste en la calle o una punta de un contacto..."
        className="rounded-brand border border-brand-border px-4 py-3 text-brand-text outline-none focus:border-brand-blue disabled:bg-brand-bg disabled:text-brand-text/50"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-brand-text/50">
          {value.length}/{MAX_LENGTH}
        </span>
        <Button onClick={onSubmit} disabled={disabled || isEmpty} className="w-full sm:w-auto">
          Generar plan de investigación
        </Button>
      </div>
    </div>
  );
}
