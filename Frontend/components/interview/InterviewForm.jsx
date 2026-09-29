"use client";

import Input from "../ui/Input";
import Button from "../ui/Button";

const MAX_TOPIC_LENGTH = 500;
const MAX_GOAL_LENGTH = 1000;

export const INTERVIEW_TYPE_OPTIONS = [
  { value: "breve", label: "⚡ Breve", hint: "~10 min, teléfono o calle" },
  { value: "a_fondo", label: "🧭 A fondo", hint: "30 min o más" },
  { value: "en_vivo", label: "📻 En vivo", hint: "radio o TV" },
];

export default function InterviewForm({ values, onChange, onSubmit, disabled }) {
  const { interviewee, topic, goal, interviewType, research } = values;
  const isEmpty = interviewee.trim().length === 0 || topic.trim().length === 0;

  function update(field, value) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        id="interviewee"
        label="¿A quién vas a entrevistar?"
        value={interviewee}
        onChange={(e) => update("interviewee", e.target.value)}
        disabled={disabled}
        maxLength={300}
        placeholder="Ej: María Pérez, directora de Salud Pública del municipio"
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="topic" className="text-sm font-medium text-brand-text">
          ¿Sobre qué tema?
        </label>
        <textarea
          id="topic"
          value={topic}
          onChange={(e) => update("topic", e.target.value)}
          disabled={disabled}
          maxLength={MAX_TOPIC_LENGTH}
          rows={3}
          placeholder="Ej: El retraso en la construcción del nuevo hospital regional"
          className="rounded-brand border border-brand-border px-4 py-3 text-brand-text outline-none focus:border-brand-blue disabled:bg-brand-bg disabled:text-brand-text/50"
        />
        <span className="self-end text-xs text-brand-text/50">
          {topic.length}/{MAX_TOPIC_LENGTH}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="goal" className="text-sm font-medium text-brand-text">
          🎯 ¿Qué quieres conseguir? <span className="font-normal text-brand-text/50">(opcional)</span>
        </label>
        <textarea
          id="goal"
          value={goal}
          onChange={(e) => update("goal", e.target.value)}
          disabled={disabled}
          maxLength={MAX_GOAL_LENGTH}
          rows={2}
          placeholder="Ej: Que confirme la nueva fecha de entrega y explique en qué se gastaron los fondos adicionales"
          className="rounded-brand border border-brand-border px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-blue disabled:bg-brand-bg disabled:text-brand-text/50"
        />
      </div>

      <fieldset className="flex flex-col gap-2" disabled={disabled}>
        <legend className="mb-2 text-sm font-medium text-brand-text">Tipo de entrevista</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {INTERVIEW_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              htmlFor={`interview-type-${option.value}`}
              className="flex cursor-pointer items-center gap-2 rounded-brand border border-brand-border px-3 py-3 text-sm text-brand-text transition-colors hover:border-brand-blue has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5 md:py-2"
            >
              <input
                id={`interview-type-${option.value}`}
                type="radio"
                name="interview_type"
                checked={interviewType === option.value}
                onChange={() => update("interviewType", option.value)}
                className="h-4 w-4 accent-brand-blue"
              />
              <span>
                {option.label} <span className="text-xs text-brand-text/50">· {option.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label
        htmlFor="research"
        className="flex cursor-pointer items-start gap-3 rounded-brand border border-brand-border px-3 py-3 text-sm text-brand-text transition-colors hover:border-brand-blue has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5"
      >
        <input
          id="research"
          type="checkbox"
          checked={research}
          onChange={(e) => update("research", e.target.checked)}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue"
        />
        <span>
          <span className="font-medium">🌐 Investigar al entrevistado en internet</span>
          <span className="block text-xs text-brand-text/60">
            Busca sus declaraciones y datos recientes para que las preguntas sean más precisas. Tarda unos 30
            segundos más.
          </span>
        </span>
      </label>

      <Button onClick={onSubmit} disabled={disabled || isEmpty} className="w-full sm:w-auto">
        Preparar entrevista
      </Button>
    </div>
  );
}
