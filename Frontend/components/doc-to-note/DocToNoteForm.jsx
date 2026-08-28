"use client";

import { useCallback, useRef, useState } from "react";
import { FileText } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import RadioGroup from "../ui/RadioGroup";

const ACCEPTED_TYPES = ".pdf,.docx,.txt";

const FORMAT_OPTIONS = ["📰 Nota periodística", "📋 Comunicado de prensa"];
const TONE_OPTIONS = ["Informativo", "Institucional", "Ejecutivo"];
const LENGTH_OPTIONS = ["Breve (1-2 párrafos)", "Completa"];

export default function DocToNoteForm({ onSubmit, isFree, disabled }) {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [tone, setTone] = useState("Informativo");
  const [length, setLength] = useState("Completa");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

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
      file,
      format,
      organizationName: format === "📋 Comunicado de prensa" ? organizationName : undefined,
      tone,
      length,
    });
  }

  const canSubmit = !disabled && !!file && !!format;

  return (
    <div className="flex flex-col gap-4">
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

      {isFree && (
        <p className="rounded-brand bg-brand-yellow/10 px-3 py-2 text-xs text-brand-text/70">
          Plan gratuito: máximo 5 páginas o 50KB. Actualiza para documentos más grandes →
        </p>
      )}

      <Button onClick={handleSubmit} disabled={!canSubmit}>
        Generar nota
      </Button>
    </div>
  );
}
