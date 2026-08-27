"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";

const PLATFORM_TITLES = {
  instagram: "📸 Instagram",
  twitter: "🐦 X/Twitter",
  linkedin: "💼 LinkedIn",
};

export default function SocialShareModal({ open, platform, copy, loading, error, onClose, onCopyChange }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(copy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal open={open} onClose={onClose} title={PLATFORM_TITLES[platform] || "Compartir"}>
      <div className="flex flex-col gap-4">
        {loading && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Spinner />
            <span className="text-sm text-brand-text/70">Generando el copy...</span>
          </div>
        )}

        {error && <p className="text-sm text-brand-error">{error}</p>}

        {!loading && !error && (
          <textarea
            value={copy}
            onChange={(e) => onCopyChange(e.target.value)}
            rows={10}
            className="rounded-brand border border-brand-border px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-blue"
          />
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {!loading && !error && (
            <Button onClick={handleCopy} className="w-full sm:w-auto">
              📋 {copied ? "¡Copiado!" : "Copiar"}
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            ✕ Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
