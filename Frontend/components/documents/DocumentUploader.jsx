"use client";

import { useCallback, useRef, useState } from "react";
import { FileText } from "lucide-react";
import Button from "../ui/Button";
import Checkbox from "../ui/Checkbox";
import { ANALYSIS_TYPES } from "../../utils/documentAnalysisTypes";

const ACCEPTED_TYPES = ".pdf,.docx,.xlsx,.csv";

export default function DocumentUploader({ onSubmit, isFree, disabled }) {
  const [file, setFile] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  function handleFileChange(selectedFile) {
    if (!selectedFile) return;
    setFile(selectedFile);
  }

  function toggleType(slug) {
    setSelectedTypes((prev) => (prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]));
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileChange(dropped);
  }, []);

  function handleSubmit() {
    if (file && selectedTypes.length > 0) onSubmit({ file, analysisTypes: selectedTypes });
  }

  const canSubmit = !disabled && !!file && selectedTypes.length > 0;

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
        <p className="text-xs text-brand-text/50">PDF, Word (.docx), Excel (.xlsx), CSV</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-brand-text">¿Qué quieres analizar?</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ANALYSIS_TYPES.map(({ slug, emoji, label }) => (
            <Checkbox
              key={slug}
              id={`analysis-${slug}`}
              label={`${emoji} ${label}`}
              checked={selectedTypes.includes(slug)}
              onChange={() => toggleType(slug)}
            />
          ))}
        </div>
      </div>

      {isFree && (
        <p className="rounded-brand bg-brand-yellow/10 px-3 py-2 text-xs text-brand-text/70">
          Plan gratuito: máximo 5 páginas o 500KB. Actualiza para documentos más grandes →
        </p>
      )}

      <Button onClick={handleSubmit} disabled={!canSubmit}>
        Analizar documento
      </Button>
    </div>
  );
}
