"use client";

import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { downloadAsPdf, downloadAsWord } from "../../services/downloads.service";

export default function ArticleResult({ article, onArticleChange, onSaveToProject, onReset }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(article.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="flex flex-col gap-4">
      <input
        value={article.title}
        onChange={(e) => onArticleChange({ ...article, title: e.target.value })}
        className="rounded-brand border border-brand-border px-3 py-2 text-lg font-bold text-brand-text outline-none focus:border-brand-blue"
      />

      <textarea
        value={article.body}
        onChange={(e) => onArticleChange({ ...article, body: e.target.value })}
        rows={14}
        className="rounded-brand border border-brand-border px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-blue"
      />

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => downloadAsPdf(article)}>⬇️ Descargar PDF</Button>
        <Button onClick={() => downloadAsWord(article)}>⬇️ Descargar Word</Button>
        <Button variant="secondary" onClick={handleCopy}>
          📋 {copied ? "¡Copiado!" : "Copiar texto"}
        </Button>
      </div>

      <div className="flex gap-3 border-t border-brand-border pt-4">
        <Button variant="secondary" onClick={onReset}>
          Nueva transcripción
        </Button>
        <Button onClick={onSaveToProject}>Guardar en proyecto →</Button>
      </div>
    </Card>
  );
}
