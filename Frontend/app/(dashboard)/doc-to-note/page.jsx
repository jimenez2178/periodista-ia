"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DocToNoteForm from "../../../components/doc-to-note/DocToNoteForm";
import DocToNoteResult from "../../../components/doc-to-note/DocToNoteResult";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import SaveToProjectModal from "../../../components/projects/SaveToProjectModal";
import { generateNoteFromDocument } from "../../../services/doc-to-note.service";
import { addItemToProject } from "../../../services/projects.service";
import { useCredits } from "../../../hooks/useCredits";
import { setPrefilledInput } from "../../../hooks/usePrefilledInput";
import { useUnsavedWarning } from "../../../hooks/useUnsavedWarning";

function firstSentence(text) {
  const sentence = (text || "").split(/(?<=[.!?])\s+/)[0];
  return sentence || text || "";
}

export default function DocToNotePage() {
  const router = useRouter();
  const { credits, refreshCredits } = useCredits();

  const [generating, setGenerating] = useState(false);
  const [article, setArticle] = useState(null);
  // El formulario sigue montado (oculto) mientras se ve la nota, para poder
  // generar otra versión sin volver a subir el documento ni elegir las opciones.
  const [showForm, setShowForm] = useState(true);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedToProject, setSavedToProject] = useState(false);

  useUnsavedWarning(!!article && !savedToProject, () => setShowSaveModal(true));

  async function handleGenerate(options) {
    setGenerating(true);
    setError("");
    setNeedsUpgrade(false);

    try {
      const data = await generateNoteFromDocument(options);
      setArticle(data);
      setSavedToProject(false);
      setShowForm(false);
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
    await addItemToProject({ projectId, type: "article", itemId: article.id });
    setSavedToProject(true);
    setToastMessage("Guardado en el proyecto.");
  }

  function handleVerify() {
    setPrefilledInput("verification", firstSentence(article.body));
    router.push("/verification");
  }

  function handleReset() {
    setArticle(null);
    setSavedToProject(false);
    setShowForm(true);
    setFormKey((key) => key + 1);
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

      <div className={showForm && !generating ? "" : "hidden"}>
        <DocToNoteForm
          key={formKey}
          onSubmit={handleGenerate}
          isFree={credits?.plan === "free"}
          disabled={generating}
          submitLabel={article ? "Generar otra versión" : "Generar nota"}
        />
      </div>

      {error && <p className="text-sm text-brand-error">{error}</p>}
      {needsUpgrade && <UpgradePrompt />}

      {generating && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Redactando tu nota...</span>
        </div>
      )}

      {article && !generating && (
        <>
          {showForm && (
            <p className="text-sm text-brand-text/60">
              Esta es tu versión actual. Cambia las opciones de arriba para generar otra.
            </p>
          )}
          <DocToNoteResult
            article={article}
            onArticleChange={setArticle}
            onVerify={handleVerify}
            onSaveToProject={() => setShowSaveModal(true)}
            onRegenerate={showForm ? undefined : () => setShowForm(true)}
            onReset={handleReset}
          />
        </>
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
