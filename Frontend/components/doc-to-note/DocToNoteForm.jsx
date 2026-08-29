"use client";

import { useCallback, useRef, useState } from "react";
import { FileText } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import RadioGroup from "../ui/RadioGroup";

const ACCEPTED_TYPES = ".pdf,.docx,.txt";

const INPUT_MODE_OPTIONS = ["📄 Subir archivo", "✏️ Pegar texto"];
const FORMAT_OPTIONS = ["📰 Nota periodística", "📋 Comunicado de prensa"];
const TONE_OPTIONS = ["Informativo", "Institucional", "Ejecutivo"];
const LENGTH_OPTIONS = ["Breve (1-2 párrafos)", "Completa"];
const MAX_PASTED_TEXT_LENGTH = 5000;

export default function DocToNoteForm({ onSubmit, isFree, disabled }) {
  const [inputMode, setInputMode] = useState(INPUT_MODE_OPTIONS[0]);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [format, setFormat] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [tone, setTone] = useState("Informativo");
  const [length, setLength] = useState("Completa");
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
      organizationName: format === "📋 Comunicado de prensa" ? organizationName : undefined,
      tone,
      length,
    });
  }

  const hasValidInput = inputMode === INPUT_MODE_OPTIONS[0] ? !!file : !!text.trim();
  const canSubmit = !disabled && hasValidInput && !!format;

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
        <RadioGroup name="format" options={FORMAT_OPTIONS} value={format} onChange={setFormat} />
      </div>

      {format === "📋 Comunicado de prensa" && (
        <Input
          id="organization_name"
          label="Nombre de la organización"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
        />
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-brand-text">Tono</span>
        <RadioGroup name="tone" options={TONE_OPTIONS} value={tone} onChange={setTone} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-brand-text">Extensión</span>
        <RadioGroup name="length" options={LENGTH_OPTIONS} value={length} onChange={setLength} />
      </div>

      {isFree && inputMode === INPUT_MODE_OPTIONS[0] && (
        <p className="rounded-brand bg-brand-yellow/10 px-3 py-2 text-xs text-brand-text/70">
          Plan gratuito: máximo 5 páginas o 500KB. Actualiza para documentos más grandes →
        </p>
      )}

      <Button onClick={handleSubmit} disabled={!canSubmit}>
        Generar nota
      </Button>
    </div>
  );
}
