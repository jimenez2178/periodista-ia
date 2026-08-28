"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DocToNoteForm from "../../../components/doc-to-note/DocToNoteForm";
import DocToNoteResult from "../../../components/doc-to-note/DocToNoteResult";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import SaveToProjectModal from "../../../components/projects/SaveToProjectModal";
import { generateNoteFromDocument, saveNoteToProject } from "../../../services/doc-to-note.service";
import { useCredits } from "../../../hooks/useCredits";
import { setPrefilledInput } from "../../../hooks/usePrefilledInput";

function firstSentence(text) {
  const sentence = (text || "").split(/(?<=[.!?])\s+/)[0];
  return sentence || text || "";
}

export default function DocToNotePage() {
  const router = useRouter();
  const { credits, refreshCredits } = useCredits();

  const [generating, setGenerating] = useState(false);
  const [article, setArticle] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  async function handleGenerate({ file, format, organizationName, tone, length }) {
    setGenerating(true);
    setError("");
    setNeedsUpgrade(false);

    try {
      const data = await generateNoteFromDocument({ file, format, organizationName, tone, length });
      setArticle({ title: data.title, body: data.body });
      setMeta({ format: data.format, organizationName });
      refreshCredits();
    } catch (err) {
      if (err.status === 402) {
        setNeedsUpgrade(true);
        if (err.code === "DOCUMENT_TOO_LARGE") setError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveToProject(projectId) {
    await saveNoteToProject({
      title: article.title,
      body: article.body,
      format: meta.format,
      organizationName: meta.organizationName,
      projectId,
    });
    setToastMessage("Guardado en el proyecto.");
  }

  function handleVerify() {
    setPrefilledInput("verification", firstSentence(article.body));
    router.push("/verification");
  }

  function handleReset() {
    setArticle(null);
    setMeta(null);
    setError("");
    setNeedsUpgrade(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">📝 De documento a nota</h1>
        <p className="mt-1 text-sm text-brand-text/70">
          Sube un documento y conviértelo directo en una nota lista para publicar.
        </p>
      </div>

      {!article && !generating && (
        <DocToNoteForm onSubmit={handleGenerate} isFree={credits?.plan === "free"} disabled={generating} />
      )}

      {error && <p className="text-sm text-brand-error">{error}</p>}
      {needsUpgrade && <UpgradePrompt />}

      {generating && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Redactando tu nota...</span>
        </div>
      )}

      {article && !generating && (
        <DocToNoteResult
          article={article}
          onArticleChange={setArticle}
          onVerify={handleVerify}
          onSaveToProject={() => setShowSaveModal(true)}
          onReset={handleReset}
        />
      )}

      <SaveToProjectModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSaveToProject}
      />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage("")} />}
    </div>
  );
}
