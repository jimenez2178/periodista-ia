"use client";

import { useEffect, useRef, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { downloadAsPdf, downloadAsWord } from "../../services/downloads.service";
import { updateArticle } from "../../services/articles.service";

const AUTOSAVE_DELAY_MS = 1000;

const SAVE_STATUS_LABELS = {
  saving: "Guardando cambios...",
  saved: "✓ Cambios guardados",
  empty: "El título y el cuerpo no pueden quedar vacíos — estos cambios no se guardarán.",
};

export default function ArticleResult({ article, onArticleChange, onSaveToProject, onReset }) {
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");

  // Las notas que ya existen en la base (tienen id) se autoguardan al editarlas;
  // sin esto, "Guardar en proyecto" y el historial mostraban el texto original de la IA.
  const articleIdRef = useRef(article.id);
  const lastSavedRef = useRef({ title: article.title, body: article.body });
  const pendingRef = useRef(null);
  const saveChainRef = useRef(Promise.resolve());

  function flushPendingSave() {
    const pending = pendingRef.current;
    if (!pending || !articleIdRef.current) return;
    pendingRef.current = null;
    setSaveStatus("saving");

    // Encadenamos los guardados para que una respuesta lenta no pise a una más reciente.
    saveChainRef.current = saveChainRef.current.then(async () => {
      try {
        await updateArticle(articleIdRef.current, pending);
        lastSavedRef.current = pending;
        if (!pendingRef.current) setSaveStatus("saved");
      } catch {
        if (!pendingRef.current) pendingRef.current = pending;
        setSaveStatus("error");
      }
    });
  }

  useEffect(() => {
    if (article.id !== articleIdRef.current) {
      // La nota acaba de guardarse por primera vez con el texto actual (ej. "De documento a nota").
      articleIdRef.current = article.id;
      lastSavedRef.current = { title: article.title, body: article.body };
    }
    if (!article.id) return;

    const last = lastSavedRef.current;
    if (article.title === last.title && article.body === last.body) {
      pendingRef.current = null;
      setSaveStatus((prev) => (prev === "empty" ? "idle" : prev));
      return;
    }

    if (!article.title.trim() || !article.body.trim()) {
      pendingRef.current = null;
      setSaveStatus("empty");
      return;
    }

    pendingRef.current = { title: article.title, body: article.body };
    const timer = setTimeout(flushPendingSave, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [article.id, article.title, article.body]);

  // Si el periodista sale de la página antes de que venza el debounce, mandamos
  // el último cambio igual (keepalive permite que la petición sobreviva a la navegación).
  useEffect(() => {
    return () => {
      const pending = pendingRef.current;
      if (pending && articleIdRef.current) {
        updateArticle(articleIdRef.current, pending, { keepalive: true }).catch(() => {});
      }
    };
  }, []);

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

      {article.id && saveStatus !== "idle" && (
        <p
          className={`text-xs ${saveStatus === "error" || saveStatus === "empty" ? "text-brand-error" : "text-brand-text/50"}`}
          aria-live="polite"
        >
          {saveStatus === "error" ? (
            <>
              No pudimos guardar tus cambios.{" "}
              <button type="button" onClick={flushPendingSave} className="font-medium underline">
                Reintentar
              </button>
            </>
          ) : (
            SAVE_STATUS_LABELS[saveStatus]
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => downloadAsPdf(article)}>⬇️ Descargar PDF</Button>
        <Button onClick={() => downloadAsWord(article)}>⬇️ Descargar Word</Button>
        <Button variant="secondary" onClick={handleCopy}>
          📋 {copied ? "¡Copiado!" : "Copiar texto"}
        </Button>
      </div>

      {(onReset || onSaveToProject) && (
        <div className="flex flex-col gap-3 border-t border-brand-border pt-4 sm:flex-row">
          {onReset && (
            <Button variant="secondary" onClick={onReset} className="w-full sm:w-auto">
              Nueva transcripción
            </Button>
          )}
          {onSaveToProject && (
            <Button onClick={onSaveToProject} className="w-full sm:w-auto">
              Guardar en proyecto →
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
