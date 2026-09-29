"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import RadioGroup from "../ui/RadioGroup";
import {
  FORMAT_OPTIONS,
  LENGTH_OPTIONS,
  NEWS_FORMAT,
  PRESS_RELEASE_FORMAT,
  TONE_OPTIONS_BY_FORMAT,
} from "../../utils/noteOptions";

// `story` es la historia sugerida por el análisis en la que se enfoca la nota;
// sin ella, la nota se redacta sobre lo más relevante del documento.
export default function DocumentNoteModal({ open, story, onClose, onSubmit, loading }) {
  const [format, setFormat] = useState(NEWS_FORMAT);
  const [organizationName, setOrganizationName] = useState("");
  const [tone, setTone] = useState(TONE_OPTIONS_BY_FORMAT[NEWS_FORMAT][0]);
  const [length, setLength] = useState(LENGTH_OPTIONS[1]);

  const isPressRelease = format === PRESS_RELEASE_FORMAT;
  const canSubmit = !loading && (!isPressRelease || organizationName.trim());

  function handleFormatChange(value) {
    setFormat(value);
    setTone(TONE_OPTIONS_BY_FORMAT[value][0]);
  }

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
          <RadioGroup
            name="document_note_format"
            options={FORMAT_OPTIONS}
            value={format}
            onChange={handleFormatChange}
          />
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
          <RadioGroup
            name="document_note_tone"
            options={TONE_OPTIONS_BY_FORMAT[format]}
            value={tone}
            onChange={setTone}
          />
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
