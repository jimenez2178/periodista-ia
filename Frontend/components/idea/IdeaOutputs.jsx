"use client";

import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

const MAX_REPORTING_LENGTH = 15000;

export const OUTPUT_KINDS = [
  {
    kind: "pitch",
    emoji: "📨",
    title: "Pitch al editor",
    description: "Propón la historia: por qué importa, hipótesis, fuentes y tiempo.",
  },
  {
    kind: "skeleton",
    emoji: "🦴",
    title: "Esqueleto de nota",
    description: "Lead y estructura con [PENDIENTE] donde falten datos del reporteo.",
  },
  {
    kind: "reported",
    emoji: "📰",
    title: "Nota con mi reporteo",
    description: "Pega tus hallazgos (datos, citas, documentos) y redacta la nota.",
  },
];

export default function IdeaOutputs({ onGenerate, disabled }) {
  const [showReportingModal, setShowReportingModal] = useState(false);
  const [reporting, setReporting] = useState("");

  function handleSelect(kind) {
    if (kind === "reported") {
      setShowReportingModal(true);
      return;
    }
    onGenerate({ kind });
  }

  function handleSubmitReporting() {
    setShowReportingModal(false);
    onGenerate({ kind: "reported", reporting: reporting.trim() });
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-brand-text">✍️ ¿Qué quieres producir con este plan?</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {OUTPUT_KINDS.map(({ kind, emoji, title, description }) => (
          <Card key={kind} variant="elevated" className="flex flex-col gap-2">
            <h4 className="font-bold text-brand-text">
              {emoji} {title}
            </h4>
            <p className="flex-1 text-sm text-brand-text/70">{description}</p>
            <Button onClick={() => handleSelect(kind)} disabled={disabled} variant="secondary">
              Generar
            </Button>
          </Card>
        ))}
      </div>

      <Modal open={showReportingModal} onClose={() => setShowReportingModal(false)} title="Nota con mi reporteo">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-brand-text/70">
            Pega lo que ya confirmaste: datos, cifras, citas de tus fuentes, extractos de documentos. La nota solo
            afirmará lo que esté aquí.
          </p>
          <textarea
            value={reporting}
            onChange={(e) => setReporting(e.target.value)}
            maxLength={MAX_REPORTING_LENGTH}
            rows={10}
            autoFocus
            aria-label="Hallazgos del reporteo"
            placeholder={'Ej: El director del hospital confirmó que faltan 40 camas. "No hemos recibido los fondos", dijo...'}
            className="rounded-brand border border-brand-border px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-blue"
          />
          <p className="self-end text-xs text-brand-text/50">
            {reporting.length}/{MAX_REPORTING_LENGTH}
          </p>
          <Button onClick={handleSubmitReporting} disabled={!reporting.trim()}>
            Redactar nota
          </Button>
        </div>
      </Modal>
    </div>
  );
}
