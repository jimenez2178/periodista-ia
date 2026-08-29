"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import IdeaInput from "../../../components/idea/IdeaInput";
import InvestigationPlan from "../../../components/idea/InvestigationPlan";
import IdeaToNoteModal from "../../../components/idea/IdeaToNoteModal";
import IdeaNoteResult from "../../../components/idea/IdeaNoteResult";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import NextStepsPanel from "../../../components/ui/NextStepsPanel";
import SaveToProjectModal from "../../../components/projects/SaveToProjectModal";
import { generateInvestigationPlan } from "../../../services/ideas.service";
import { saveIdeaSession } from "../../../services/sessions.service";
import { generateArticle } from "../../../services/articles.service";
import { addItemToProject } from "../../../services/projects.service";
import { useCredits } from "../../../hooks/useCredits";
import { usePrefilledInput, setPrefilledInput } from "../../../hooks/usePrefilledInput";
import { useUnsavedWarning } from "../../../hooks/useUnsavedWarning";

export default function IdeaPage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedToProject, setSavedToProject] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteGenerating, setNoteGenerating] = useState(false);
  const [note, setNote] = useState(null);
  const [noteError, setNoteError] = useState("");
  const [noteNeedsUpgrade, setNoteNeedsUpgrade] = useState(false);
  const [showNoteSaveModal, setShowNoteSaveModal] = useState(false);
  const [noteSavedToProject, setNoteSavedToProject] = useState(false);

  const { refreshCredits } = useCredits();
  const prefilledIdea = usePrefilledInput("idea");

  useUnsavedWarning(
    (!!plan && !savedToProject) || (!!note && !noteSavedToProject),
    () => setShowSaveModal(true),
  );

  useEffect(() => {
    if (prefilledIdea) setIdea(prefilledIdea);
  }, [prefilledIdea]);

  async function handleSaveToProject(projectId) {
    const session = await saveIdeaSession({ idea: idea.trim(), plan, projectId });
    setSessionId(session.id);
    setSavedToProject(true);
    setToastMessage("Guardado en el proyecto.");
  }

  function handleVerifyClaim() {
    setPrefilledInput("verification", idea);
    router.push("/verification");
  }

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setNeedsUpgrade(false);

    try {
      const result = await generateInvestigationPlan(idea.trim());
      setPlan(result);
      refreshCredits();
    } catch (err) {
      if (err.status === 402) {
        setNeedsUpgrade(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateNote({ type, organizationName }) {
    setShowNoteModal(false);
    setNoteGenerating(true);
    setNoteError("");
    setNoteNeedsUpgrade(false);

    try {
      const saved = await generateArticle({
        idea_text: idea.trim(),
        plan,
        session_id: sessionId,
        type,
        organization_name: organizationName,
      });
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
    setToastMessage("Guardado en el proyecto.");
  }

  function handleReset() {
    setIdea("");
    setPlan(null);
    setSavedToProject(false);
    setSessionId(null);
    setNote(null);
    setNoteError("");
    setNoteNeedsUpgrade(false);
    setNoteSavedToProject(false);
    setError("");
    setNeedsUpgrade(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">💡 Tengo una idea</h1>
        <p className="mt-1 text-sm text-brand-text/70">
          Convierte una observación en un plan de investigación completo.
        </p>
      </div>

      <IdeaInput value={idea} onChange={setIdea} onSubmit={handleGenerate} disabled={loading || !!plan} />

      {error && <p className="text-sm text-brand-error">{error}</p>}
      {needsUpgrade && <UpgradePrompt />}

      {loading && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Generando tu plan...</span>
        </div>
      )}

      {plan && !loading && (
        <>
          <InvestigationPlan plan={plan} />

          <div className="flex justify-end">
            <Button onClick={() => setShowNoteModal(true)} disabled={noteGenerating}>
              📰 Generar nota basada en esta investigación
            </Button>
          </div>

          {noteError && <p className="text-sm text-brand-error">{noteError}</p>}
          {noteNeedsUpgrade && <UpgradePrompt />}

          {noteGenerating && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Spinner />
              <span className="text-brand-text/70">Generando tu nota...</span>
            </div>
          )}

          {note && !noteGenerating && (
            <IdeaNoteResult
              article={note}
              onArticleChange={setNote}
              onSaveToProject={() => setShowNoteSaveModal(true)}
            />
          )}

          <NextStepsPanel
            actions={[
              { emoji: "🔍", label: "Verificar una afirmación", onClick: handleVerifyClaim },
              { emoji: "📄", label: "Analizar un documento", onClick: () => router.push("/documents") },
              { emoji: "🎙️", label: "Preparar entrevista", onClick: () => router.push("/interview") },
              { emoji: "💾", label: "Guardar en proyecto", onClick: () => setShowSaveModal(true) },
            ]}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={handleReset} className="w-full sm:w-auto">
              Nueva idea
            </Button>
            <Button onClick={() => setShowSaveModal(true)} className="w-full sm:w-auto">
              Guardar en proyecto →
            </Button>
          </div>
        </>
      )}

      <IdeaToNoteModal
        open={showNoteModal}
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
