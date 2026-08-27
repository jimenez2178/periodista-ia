"use client";

import Input from "../ui/Input";
import Button from "../ui/Button";

const MAX_TOPIC_LENGTH = 500;

export default function InterviewForm({ interviewee, topic, onIntervieweeChange, onTopicChange, onSubmit, disabled }) {
  const isEmpty = interviewee.trim().length === 0 || topic.trim().length === 0;

  return (
    <div className="flex flex-col gap-4">
      <Input
        id="interviewee"
        label="¿A quién vas a entrevistar?"
        value={interviewee}
        onChange={(e) => onIntervieweeChange(e.target.value)}
        disabled={disabled}
        placeholder="Ej: María Pérez, directora de Salud Pública del municipio"
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="topic" className="text-sm font-medium text-brand-text">
          ¿Sobre qué tema?
        </label>
        <textarea
          id="topic"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          disabled={disabled}
          maxLength={MAX_TOPIC_LENGTH}
          rows={4}
          placeholder="Ej: El retraso en la construcción del nuevo hospital regional"
          className="rounded-brand border border-brand-border px-4 py-3 text-brand-text outline-none focus:border-brand-blue disabled:bg-brand-bg disabled:text-brand-text/50"
        />
        <span className="self-end text-xs text-brand-text/50">
          {topic.length}/{MAX_TOPIC_LENGTH}
        </span>
      </div>

      <Button onClick={onSubmit} disabled={disabled || isEmpty} className="w-full sm:w-auto">
        Preparar preguntas
      </Button>
    </div>
  );
}
