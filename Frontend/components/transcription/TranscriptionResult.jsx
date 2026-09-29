"use client";

import Card from "../ui/Card";

const LANGUAGE_LABELS = { es: "Español", en: "Inglés", fr: "Francés", pt: "Portugués" };

export default function TranscriptionResult({ transcript, originalTranscript, language, onTranscriptChange, disabled }) {
  const edited = transcript !== originalTranscript;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-brand-text">Transcripción</h2>
        <span className="w-fit rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue">
          {(LANGUAGE_LABELS[language] || language || "Idioma desconocido") + " detectado"}
        </span>
      </div>

      <p className="text-xs text-brand-text/60">
        La transcripción automática puede equivocarse en nombres propios, siglas o cifras. Corrígela aquí: la nota
        se redacta con este texto.
      </p>

      <textarea
        value={transcript}
        onChange={(e) => onTranscriptChange(e.target.value)}
        disabled={disabled}
        rows={10}
        aria-label="Transcripción"
        className="rounded-brand border border-brand-border bg-brand-bg px-4 py-3 text-sm text-brand-text/80 outline-none focus:border-brand-blue disabled:text-brand-text/50"
      />

      {edited && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-brand-text/60">✏️ Editaste la transcripción. Se guardará al generar la nota.</span>
          <button
            type="button"
            onClick={() => onTranscriptChange(originalTranscript)}
            disabled={disabled}
            className="font-medium text-brand-blue hover:underline"
          >
            Deshacer cambios
          </button>
        </div>
      )}
    </Card>
  );
}
