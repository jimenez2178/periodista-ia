"use client";

import { useCallback, useRef, useState } from "react";
import { FileText } from "lucide-react";
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

const ACCEPTED_TYPES = ".pdf,.docx,.txt";

const INPUT_MODE_OPTIONS = ["📄 Subir archivo", "✏️ Pegar texto"];
const MAX_PASTED_TEXT_LENGTH = 5000;
const MAX_ANGLE_LENGTH = 1000;

export default function DocToNoteForm({ onSubmit, isFree, disabled, submitLabel = "Generar nota" }) {
  const [inputMode, setInputMode] = useState(INPUT_MODE_OPTIONS[0]);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [format, setFormat] = useState(NEWS_FORMAT);
  const [organizationName, setOrganizationName] = useState("");
  const [tone, setTone] = useState(TONE_OPTIONS_BY_FORMAT[NEWS_FORMAT][0]);
  const [length, setLength] = useState(LENGTH_OPTIONS[1]);
  const [angle, setAngle] = useState("");

  function handleFormatChange(value) {
    setFormat(value);
    setTone(TONE_OPTIONS_BY_FORMAT[value][0]);
  }
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  function handleInputModeChange(mode) {
    setInputMode(mode);
    if (mode === INPUT_MODE_OPTIONS[0]) {
      setText("");
    } else {
      setFile(null);
    }
  }

  function handleFileChange(selectedFile) {
    if (!selectedFile) return;
    setFile(selectedFile);
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileChange(dropped);
  }, []);

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      file: inputMode === INPUT_MODE_OPTIONS[0] ? file : undefined,
      text: inputMode === INPUT_MODE_OPTIONS[1] ? text.trim() : undefined,
      format,
      organizationName: format === PRESS_RELEASE_FORMAT ? organizationName.trim() : undefined,
      tone,
      length,
      angle: angle.trim() || undefined,
    });
  }

  const hasValidInput = inputMode === INPUT_MODE_OPTIONS[0] ? !!file : !!text.trim();
  const hasOrganization = format !== PRESS_RELEASE_FORMAT || !!organizationName.trim();
  const canSubmit = !disabled && hasValidInput && hasOrganization;

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup name="input_mode" options={INPUT_MODE_OPTIONS} value={inputMode} onChange={handleInputModeChange} />

      {inputMode === INPUT_MODE_OPTIONS[0] ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-brand border-2 border-dashed px-6 py-10 text-center transition-colors ${
            isDragging ? "border-brand-blue bg-brand-blue/5" : "border-brand-border"
          }`}
        >
          <FileText className="text-brand-blue" size={32} />
          <p className="font-medium text-brand-text">
            {file ? file.name : "Arrastra tu documento aquí o haz clic para subir"}
          </p>
          <p className="text-xs text-brand-text/50">PDF, Word (.docx), TXT</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_PASTED_TEXT_LENGTH}
            rows={10}
            placeholder="Pega aquí el texto que quieres convertir en nota periodística o comunicado..."
            className="rounded-brand border border-brand-border px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-blue"
          />
          <p className="self-end text-xs text-brand-text/50">
            {text.length}/{MAX_PASTED_TEXT_LENGTH}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-brand-text">Formato de salida</span>
        <RadioGroup name="format" options={FORMAT_OPTIONS} value={format} onChange={handleFormatChange} />
      </div>

      {format === PRESS_RELEASE_FORMAT && (
        <Input
          id="organization_name"
          label="Nombre de la organización"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
        />
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-brand-text">Tono</span>
        <RadioGroup name="tone" options={TONE_OPTIONS_BY_FORMAT[format]} value={tone} onChange={setTone} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-brand-text">Extensión</span>
        <RadioGroup name="length" options={LENGTH_OPTIONS} value={length} onChange={setLength} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="doc_note_angle" className="text-sm font-medium text-brand-text">
          🎯 ¿En qué quieres enfocar la nota? <span className="font-normal text-brand-text/50">(opcional)</span>
        </label>
        <textarea
          id="doc_note_angle"
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
          maxLength={MAX_ANGLE_LENGTH}
          rows={2}
          placeholder="Ej: El recorte al presupuesto de salud en las provincias del sur"
          className="rounded-brand border border-brand-border px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-blue"
        />
        <p className="text-xs text-brand-text/50">Si lo dejas vacío, la nota se enfocará en lo más relevante.</p>
      </div>

      {isFree && inputMode === INPUT_MODE_OPTIONS[0] && (
        <p className="rounded-brand bg-brand-yellow/10 px-3 py-2 text-xs text-brand-text/70">
          Plan gratuito: máximo 5 páginas o 500KB. Actualiza para documentos más grandes →
        </p>
      )}

      <Button onClick={handleSubmit} disabled={!canSubmit}>
        {submitLabel}
      </Button>
    </div>
  );
}
