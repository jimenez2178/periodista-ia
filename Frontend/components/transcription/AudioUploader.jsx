"use client";

import { useCallback, useRef, useState } from "react";
import { Mic } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const ACCEPTED_TYPES = ".mp3,.mp4,.wav,.m4a,.ogg";
// Un audio de ~27 minutos tarda ~100 s en transcribirse, el tiempo máximo que
// espera la conexión: a partir de unos 20 minutos se avisa que puede fallar.
const LONG_AUDIO_WARNING_SECS = 20 * 60;

// Lee la duración en el navegador, sin subir nada. null si no se puede leer.
function readAudioDuration(file) {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const media = document.createElement(file.type.startsWith("video/") ? "video" : "audio");
    const finish = (duration) => {
      URL.revokeObjectURL(objectUrl);
      resolve(Number.isFinite(duration) ? duration : null);
    };
    media.preload = "metadata";
    media.onloadedmetadata = () => finish(media.duration);
    media.onerror = () => finish(null);
    media.src = objectUrl;
  });
}

export default function AudioUploader({ onSubmit, isFree, disabled }) {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [longAudioMinutes, setLongAudioMinutes] = useState(null);
  const inputRef = useRef(null);
  const selectedFileRef = useRef(null);

  async function handleFileChange(selectedFile) {
    if (!selectedFile) return;
    setFile(selectedFile);
    setUrl("");
    setLongAudioMinutes(null);
    selectedFileRef.current = selectedFile;

    const duration = await readAudioDuration(selectedFile);
    // Si mientras tanto eligió otro archivo, esta lectura ya no aplica.
    if (selectedFileRef.current !== selectedFile) return;
    if (duration && duration > LONG_AUDIO_WARNING_SECS) setLongAudioMinutes(Math.round(duration / 60));
  }

  function handleUrlChange(value) {
    setUrl(value);
    if (value) {
      setFile(null);
      setLongAudioMinutes(null);
      selectedFileRef.current = null;
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileChange(dropped);
  }, []);

  function handleSubmit() {
    if (file) onSubmit({ file });
    else if (url.trim()) onSubmit({ url: url.trim() });
  }

  const canSubmit = !disabled && (!!file || !!url.trim());

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
        <Mic className="text-brand-blue" size={32} />
        <p className="font-medium text-brand-text">
          {file ? file.name : "Arrastra tu audio aquí o haz clic para subir"}
        </p>
        <p className="text-xs text-brand-text/50">MP3, MP4, WAV, M4A, OGG</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />
      </div>

      <Input
        id="audio-url"
        value={url}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder="O pega un enlace de WhatsApp, Google Drive o similar"
        disabled={!!file}
      />

      {longAudioMinutes && !isFree && (
        <p className="rounded-brand border border-brand-yellow bg-brand-yellow/10 px-4 py-3 text-sm text-brand-text">
          ⚠️ Este audio dura unos {longAudioMinutes} minutos. Los audios de más de 20 minutos pueden fallar porque la
          transcripción tarda demasiado. Si falla, divídelo en partes más cortas y súbelas por separado.
        </p>
      )}

      {isFree && (
        <p className="rounded-brand bg-brand-yellow/10 px-3 py-2 text-xs text-brand-text/70">
          Plan gratuito: máximo 2 minutos de audio. Actualiza para audios ilimitados →
        </p>
      )}

      <Button onClick={handleSubmit} disabled={!canSubmit}>
        Transcribir
      </Button>
    </div>
  );
}
