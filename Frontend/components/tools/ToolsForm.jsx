"use client";

import Button from "../ui/Button";

const MAX_LENGTH = 2000;

// Situaciones típicas para que el periodista vea qué tipo de tarea puede describir.
const EXAMPLES = [
  "Me llegó un audio de WhatsApp de un funcionario y necesito publicar la nota hoy",
  "Recibí un informe de presupuesto de 80 páginas y quiero encontrar la historia",
  "Circula un video viral con una denuncia y quiero saber si es cierto antes de publicar",
  "Tengo una entrevista de 2 horas y quiero sacar una nota larga y contenido para redes",
];

export default function ToolsForm({ value, onChange, onSubmit, disabled }) {
  const isEmpty = value.trim().length === 0;

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={MAX_LENGTH}
        rows={5}
        aria-label="Describe tu tarea"
        placeholder="Describe qué tienes entre manos y qué quieres lograr. Ej: Tengo una entrevista de 2 horas y quiero convertirla en varios contenidos para redes y una nota larga"
        className="rounded-brand border border-brand-border px-4 py-3 text-brand-text outline-none focus:border-brand-blue disabled:bg-brand-bg disabled:text-brand-text/50"
      />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-brand-text/60">O parte de un ejemplo:</span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onChange(example)}
              disabled={disabled}
              className="rounded-full border border-brand-border bg-white px-3 py-1.5 text-left text-xs text-brand-text/80 transition-colors hover:border-brand-blue disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-brand-text/50">
          {value.length}/{MAX_LENGTH}
        </span>
        <Button onClick={onSubmit} disabled={disabled || isEmpty} className="w-full sm:w-auto">
          Recomendar flujo
        </Button>
      </div>
    </div>
  );
}
