"use client";

import Card from "../ui/Card";
import Button from "../ui/Button";

export const CUSTOM_ANGLE = "custom";
export const AI_ANGLE = "ai";
const MAX_CONTEXT_LENGTH = 2000;

// Opciones de ángulo: el sugerido y los alternativos del análisis, o que la IA
// decida si el análisis no está disponible. Siempre se puede escribir uno propio.
export function buildAngleOptions(analysis) {
  if (!analysis?.suggested_angle) {
    return [{ id: AI_ANGLE, label: "Que la IA elija el ángulo más fuerte", badge: null, angle: "" }];
  }

  return [
    { id: "suggested", label: analysis.suggested_angle, badge: "Sugerido", angle: analysis.suggested_angle },
    ...(analysis.alternative_angles || []).map((angle, index) => ({
      id: `alt-${index}`,
      label: angle,
      badge: "Alternativo",
      angle,
    })),
  ];
}

export default function NoteSetup({
  angleOptions,
  angleChoice,
  onAngleChoiceChange,
  customAngle,
  onCustomAngleChange,
  context,
  onContextChange,
  selectedQuotesCount,
  disabled,
  onGenerateNews,
  onGeneratePressRelease,
}) {
  const missingCustomAngle = angleChoice === CUSTOM_ANGLE && !customAngle.trim();

  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-lg font-bold text-brand-text">Prepara tu nota</h2>

      <fieldset className="flex flex-col gap-2" disabled={disabled}>
        <legend className="mb-2 text-sm font-semibold text-brand-text">🎯 ¿Con qué ángulo la enfocamos?</legend>
        {[...angleOptions, { id: CUSTOM_ANGLE, label: "Escribir mi propio ángulo", badge: null }].map((option) => (
          <label
            key={option.id}
            htmlFor={`angle-${option.id}`}
            className="flex cursor-pointer items-start gap-2 rounded-brand border border-brand-border px-3 py-3 text-sm text-brand-text transition-colors hover:border-brand-blue has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5 md:py-2"
          >
            <input
              id={`angle-${option.id}`}
              type="radio"
              name="note_angle"
              checked={angleChoice === option.id}
              onChange={() => onAngleChoiceChange(option.id)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue"
            />
            <span>
              {option.badge && (
                <span className="mr-2 rounded-full bg-brand-yellow/20 px-2 py-0.5 text-xs font-medium text-brand-text/70">
                  {option.badge}
                </span>
              )}
              {option.label}
            </span>
          </label>
        ))}
        {angleChoice === CUSTOM_ANGLE && (
          <input
            value={customAngle}
            onChange={(e) => onCustomAngleChange(e.target.value)}
            maxLength={500}
            autoFocus
            placeholder="Ej: El impacto de la medida en los pequeños comerciantes"
            aria-label="Tu ángulo"
            className="rounded-brand border border-brand-border px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-blue"
          />
        )}
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="note_context" className="text-sm font-semibold text-brand-text">
          📌 Contexto <span className="font-normal text-brand-text/50">(opcional)</span>
        </label>
        <p className="text-xs text-brand-text/60">
          Quién habla y con qué cargo, fecha, lugar o evento. Sirve para atribuir bien las citas y corregir nombres.
        </p>
        <textarea
          id="note_context"
          value={context}
          onChange={(e) => onContextChange(e.target.value)}
          disabled={disabled}
          maxLength={MAX_CONTEXT_LENGTH}
          rows={3}
          placeholder="Ej: Entrevista a María Gómez, ministra de Salud, el 28 de septiembre en Santo Domingo, tras la rueda de prensa sobre el dengue."
          className="rounded-brand border border-brand-border px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-blue disabled:bg-brand-bg disabled:text-brand-text/50"
        />
      </div>

      <p className="text-xs text-brand-text/60">
        {selectedQuotesCount > 0
          ? `💬 ${selectedQuotesCount} ${selectedQuotesCount === 1 ? "cita elegida" : "citas elegidas"} para incluir.`
          : "💬 Sin citas elegidas: la IA escogerá las más relevantes."}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={onGenerateNews} disabled={disabled || missingCustomAngle} className="flex-1">
          📰 Generar nota periodística
        </Button>
        <Button
          onClick={onGeneratePressRelease}
          disabled={disabled || missingCustomAngle}
          variant="secondary"
          className="flex-1"
        >
          📋 Generar nota de prensa
        </Button>
      </div>
      {missingCustomAngle && <p className="text-xs text-brand-text/60">Escribe tu ángulo para continuar.</p>}
    </Card>
  );
}
