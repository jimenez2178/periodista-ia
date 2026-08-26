"use client";

import Card from "../ui/Card";
import Button from "../ui/Button";

const LANGUAGE_LABELS = { es: "Español", en: "Inglés", fr: "Francés", pt: "Portugués" };

export default function TranscriptionResult({
  transcript,
  language,
  disabled,
  onGenerateNews,
  onGeneratePressRelease,
}) {
  return (
    <Card className="flex flex-col gap-4">
      <span className="w-fit rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue">
        {(LANGUAGE_LABELS[language] || language || "Idioma desconocido") + " detectado"}
      </span>

      <div className="max-h-64 overflow-y-auto rounded-brand border border-brand-border bg-brand-bg p-4 text-sm text-brand-text/80">
        {transcript}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={onGenerateNews} disabled={disabled} className="flex-1">
          📰 Generar nota periodística
        </Button>
        <Button onClick={onGeneratePressRelease} disabled={disabled} variant="secondary" className="flex-1">
          📋 Generar nota de prensa
        </Button>
      </div>
    </Card>
  );
}
