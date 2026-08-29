"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InterviewForm from "../../../components/interview/InterviewForm";
import InterviewResults from "../../../components/interview/InterviewResults";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import NextStepsPanel from "../../../components/ui/NextStepsPanel";
import SaveToProjectModal from "../../../components/projects/SaveToProjectModal";
import { createInterviewKit } from "../../../services/interview.service";
import { addItemToProject } from "../../../services/projects.service";
import { useCredits } from "../../../hooks/useCredits";
import { useUnsavedWarning } from "../../../hooks/useUnsavedWarning";

export default function InterviewPage() {
  const router = useRouter();
  const { refreshCredits } = useCredits();

  const [interviewee, setInterviewee] = useState("");
  const [topic, setTopic] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedToProject, setSavedToProject] = useState(false);

  useUnsavedWarning(!!interview && !savedToProject, () => setShowSaveModal(true));

  async function handleSaveToProject(projectId) {
    await addItemToProject({ projectId, type: "interview", itemId: interview.id });
    setSavedToProject(true);
    setToastMessage("Guardado en el proyecto.");
  }

  async function handlePrepare() {
    setPreparing(true);
    setError("");
    setNeedsUpgrade(false);

    try {
      const data = await createInterviewKit({ interviewee: interviewee.trim(), topic: topic.trim() });
      setInterview(data);
      refreshCredits();
    } catch (err) {
      if (err.status === 402) {
        setNeedsUpgrade(true);
      } else {
        setError(err.message);
      }
    } finally {
      setPreparing(false);
    }
  }

  function handleReset() {
    setInterviewee("");
    setTopic("");
    setInterview(null);
    setSavedToProject(false);
    setError("");
    setNeedsUpgrade(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">🎙️ Preparar entrevista</h1>
        <p className="mt-1 text-sm text-brand-text/70">
          Recibe un kit completo de preguntas antes de tu próxima entrevista.
        </p>
      </div>

      {!interview && (
        <InterviewForm
          interviewee={interviewee}
          topic={topic}
          onIntervieweeChange={setInterviewee}
          onTopicChange={setTopic}
          onSubmit={handlePrepare}
          disabled={preparing}
        />
      )}

      {error && <p className="text-sm text-brand-error">{error}</p>}
      {needsUpgrade && <UpgradePrompt />}

      {preparing && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Preparando tus preguntas...</span>
        </div>
      )}

      {interview && !preparing && (
        <>
          <InterviewResults results={interview.results} />
          <NextStepsPanel
            actions={[
              { emoji: "🎙️", label: "Transcribir esta entrevista", onClick: () => router.push("/transcription") },
              { emoji: "🔍", label: "Verificar información", onClick: () => router.push("/verification") },
              { emoji: "💾", label: "Guardar en proyecto", onClick: () => setShowSaveModal(true) },
            ]}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={handleReset} className="w-full sm:w-auto">
              Nueva entrevista
            </Button>
            <Button onClick={() => setShowSaveModal(true)} className="w-full sm:w-auto">
              Guardar en proyecto →
            </Button>
          </div>
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
