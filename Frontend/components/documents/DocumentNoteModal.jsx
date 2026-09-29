"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import RadioGroup from "../ui/RadioGroup";

const FORMAT_OPTIONS = ["📰 Nota periodística", "📋 Comunicado de prensa"];
const TONE_OPTIONS = ["Informativo", "Institucional", "Ejecutivo"];
const LENGTH_OPTIONS = ["Breve (1-2 párrafos)", "Completa"];

// `story` es la historia sugerida por el análisis en la que se enfoca la nota;
// sin ella, la nota se redacta sobre lo más relevante del documento.
export default function DocumentNoteModal({ open, story, onClose, onSubmit, loading }) {
  const [format, setFormat] = useState(FORMAT_OPTIONS[0]);
  const [organizationName, setOrganizationName] = useState("");
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [length, setLength] = useState(LENGTH_OPTIONS[1]);

  const isPressRelease = format === FORMAT_OPTIONS[1];
  const canSubmit = !loading && (!isPressRelease || organizationName.trim());

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      format,
      tone,
      length,
      organizationName: isPressRelease ? organizationName.trim() : undefined,
      angle: story ? `${story.title}: ${story.description}` : undefined,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Redactar nota con este análisis">
      <div className="flex flex-col gap-4">
        <p className="rounded-brand bg-brand-blue/5 px-3 py-2 text-sm text-brand-text/80">
          {story ? (
            <>
              <span className="font-semibold">Historia: </span>
              {story.title}
            </>
          ) : (
            "La nota se enfocará en lo más relevante del documento."
          )}
        </p>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-brand-text">Formato</p>
          <RadioGroup name="document_note_format" options={FORMAT_OPTIONS} value={format} onChange={setFormat} />
        </div>

        {isPressRelease && (
          <Input
            id="document_note_organization"
            label="Nombre de la organización"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
          />
        )}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-brand-text">Tono</p>
          <RadioGroup name="document_note_tone" options={TONE_OPTIONS} value={tone} onChange={setTone} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-brand-text">Extensión</p>
          <RadioGroup name="document_note_length" options={LENGTH_OPTIONS} value={length} onChange={setLength} />
        </div>

        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {loading ? "Redactando..." : "Redactar nota"}
        </Button>
      </div>
    </Modal>
  );
}
