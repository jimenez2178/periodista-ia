"use client";

import { useState } from "react";
import { useGuardedAction, useGuardedNavigation } from "../../../context/NavigationGuardContext";
import DocumentUploader from "../../../components/documents/DocumentUploader";
import DocumentResults from "../../../components/documents/DocumentResults";
import DocumentNoteModal from "../../../components/documents/DocumentNoteModal";
import ArticleResult from "../../../components/transcription/ArticleResult";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import NextStepsPanel from "../../../components/ui/NextStepsPanel";
import SaveToProjectModal from "../../../components/projects/SaveToProjectModal";
import SocialSharePanel from "../../../components/social/SocialSharePanel";
import { analyzeDocument, generateNoteFromAnalysis } from "../../../services/documents.service";
import { addItemToProject } from "../../../services/projects.service";
import { useCredits } from "../../../hooks/useCredits";
import { setPrefilledInput } from "../../../hooks/usePrefilledInput";
import { useUnsavedWarning } from "../../../hooks/useUnsavedWarning";

export default function DocumentsPage() {
  const navigate = useGuardedNavigation();
  const guardAction = useGuardedAction();
  const { credits, refreshCredits } = useCredits();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedToProject, setSavedToProject] = useState(false);

  // Nota redactada a partir del análisis.
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteStory, setNoteStory] = useState(null);
  const [noteGenerating, setNoteGenerating] = useState(false);
  const [note, setNote] = useState(null);
  const [noteError, setNoteError] = useState("");
  const [noteNeedsUpgrade, setNoteNeedsUpgrade] = useState(false);
  const [showNoteSaveModal, setShowNoteSaveModal] = useState(false);
  const [noteSavedToProject, setNoteSavedToProject] = useState(false);

  // Antes de salir se guarda todo lo pendiente (análisis y nota) en el mismo proyecto.
  async function handleSaveAllToProject(projectId) {
    if (result && !savedToProject) await handleSaveToProject(projectId);
    if (note && !noteSavedToProject) await handleSaveNoteToProject(projectId);
  }

  useUnsavedWarning((!!result && !savedToProject) || (!!note && !noteSavedToProject), handleSaveAllToProject);

  async function handleAnalyze({ file, analysisTypes }) {
    setLoading(true);
    setError("");
    setNeedsUpgrade(false);

    try {
      const data = await analyzeDocument({ file, analysisTypes });
      setResult(data);
      refreshCredits();
    } catch (err) {
      if (err.status === 402 && err.code === "DOCUMENT_TOO_LARGE") {
        setError(
          "Tu documento supera el límite del plan gratuito (5 páginas o 500KB). Actualiza a Pro para analizar documentos más grandes."
        );
      } else if (err.status === 402) {
        setNeedsUpgrade(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveToProject(projectId) {
    await addItemToProject({ projectId, type: "document", itemId: result.id });
    setSavedToProject(true);
    setToastMessage("Guardado en el proyecto.");
  }

  function handleVerifyFinding(finding) {
    setPrefilledInput("verification", finding);
    navigate("/verification");
  }

  function handleInvestigateStory(story) {
    setPrefilledInput("idea", `${story.title}. ${story.description}`);
    navigate("/idea");
  }

  function handleTurnIntoIdea() {
    setPrefilledInput("idea", result.results.executive_summary || "");
    navigate("/idea");
  }

  function openNoteModal(story) {
    setNoteStory(story || null);
    setShowNoteModal(true);
  }

  async function handleGenerateNote(options) {
    setShowNoteModal(false);
    setNoteGenerating(true);
    setNoteError("");
    setNoteNeedsUpgrade(false);
    setNote(null);
    setNoteSavedToProject(false);

    try {
      const saved = await generateNoteFromAnalysis(result.id, options);
      setNote(saved);
      refreshCredits();
    } catch (err) {
      if (err.status === 402) {
        setNoteNeedsUpgrade(true);
      } else {
        setNoteError(err.message);
      }
    } finally {
      setNoteGenerating(false);
    }
  }

  async function handleSaveNoteToProject(projectId) {
    await addItemToProject({ projectId, type: "article", itemId: note.id });
    setNoteSavedToProject(true);
    setToastMessage("Nota guardada en el proyecto.");
  }

  function handleReset() {
    setResult(null);
    setSavedToProject(false);
    setNote(null);
    setNoteStory(null);
    setNoteError("");
    setNoteNeedsUpgrade(false);
    setNoteSavedToProject(false);
    setError("");
    setNeedsUpgrade(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">📄 Analizar documento</h1>
        <p className="mt-1 text-sm text-brand-text/70">
          Sube un PDF, Word o Excel, obtén hallazgos periodísticos clave y redacta tu nota a partir de ellos.
        </p>
      </div>

      {!result && (
        <DocumentUploader onSubmit={handleAnalyze} isFree={credits?.plan === "free"} disabled={loading} />
      )}

      {error && <p className="text-sm text-brand-error">{error}</p>}
      {needsUpgrade && <UpgradePrompt />}

      {loading && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Analizando tu documento...</span>
        </div>
      )}

      {result && !loading && (
        <>
          <p className="text-sm text-brand-text/60">📎 {result.file_name}</p>

          <DocumentResults
            analysisTypes={result.analysis_types}
            results={result.results}
            onVerifyFinding={handleVerifyFinding}
            onWriteStory={openNoteModal}
            onInvestigateStory={handleInvestigateStory}
            actionsDisabled={noteGenerating}
          />

          <div className="flex flex-col gap-3 rounded-brand border border-brand-blue/30 bg-brand-blue/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-brand-text">
              <span className="font-semibold">¿Listo para escribir?</span> Redacta una nota basada en este documento.
            </p>
            <Button onClick={() => openNoteModal(null)} disabled={noteGenerating} className="w-full sm:w-auto">
              📰 Redactar nota
            </Button>
          </div>

          {noteError && <p className="text-sm text-brand-error">{noteError}</p>}
          {noteNeedsUpgrade && <UpgradePrompt />}

          {noteGenerating && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Spinner />
              <span className="text-brand-text/70">Redactando tu nota...</span>
            </div>
          )}

          {note && !noteGenerating && (
            <>
              <ArticleResult article={note} onArticleChange={setNote} />
              <SocialSharePanel content={note.body} contentType="article" />
              <div className="flex justify-end">
                <Button onClick={() => setShowNoteSaveModal(true)}>Guardar nota en proyecto →</Button>
              </div>
            </>
          )}

          <NextStepsPanel
            actions={[
              { emoji: "💡", label: "Convertir en plan de investigación", onClick: handleTurnIntoIdea },
              { emoji: "💾", label: "Guardar análisis en proyecto", onClick: () => setShowSaveModal(true) },
            ]}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => guardAction(handleReset)} className="w-full sm:w-auto">
              Nuevo análisis
            </Button>
          </div>
        </>
      )}

      <DocumentNoteModal
        open={showNoteModal}
        story={noteStory}
        onClose={() => setShowNoteModal(false)}
        onSubmit={handleGenerateNote}
        loading={noteGenerating}
      />

      <SaveToProjectModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSaveToProject}
      />

      <SaveToProjectModal
        open={showNoteSaveModal}
        onClose={() => setShowNoteSaveModal(false)}
        onConfirm={handleSaveNoteToProject}
      />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage("")} />}
    </div>
  );
}
