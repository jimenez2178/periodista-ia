"use client";

import { useEffect, useState } from "react";
import { useGuardedAction, useGuardedNavigation } from "../../../context/NavigationGuardContext";
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
import { usePrefilledInput, setPrefilledInput } from "../../../hooks/usePrefilledInput";
import { useUnsavedWarning } from "../../../hooks/useUnsavedWarning";

const EMPTY_FORM = { interviewee: "", topic: "", goal: "", interviewType: "a_fondo", research: true };

export default function InterviewPage() {
  const navigate = useGuardedNavigation();
  const guardAction = useGuardedAction();
  const { refreshCredits } = useCredits();
  const prefilledInterviewee = usePrefilledInput("interview");

  const [form, setForm] = useState(EMPTY_FORM);
  const [preparing, setPreparing] = useState(false);
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedToProject, setSavedToProject] = useState(false);

  useUnsavedWarning(!!interview && !savedToProject, handleSaveToProject);

  useEffect(() => {
    if (prefilledInterviewee) setForm((current) => ({ ...current, interviewee: prefilledInterviewee }));
  }, [prefilledInterviewee]);

  async function handleSaveToProject(projectId) {
    await addItemToProject({ projectId, type: "interview", itemId: interview.id });
    setSavedToProject(true);
    setToastMessage("Guardado en el proyecto.");
  }

  function handleVerifyFact(fact) {
    setPrefilledInput("verification", fact);
    navigate("/verification");
  }

  async function handlePrepare() {
    setPreparing(true);
    setError("");
    setNeedsUpgrade(false);

    try {
      const data = await createInterviewKit({
        interviewee: form.interviewee.trim(),
        topic: form.topic.trim(),
        goal: form.goal.trim(),
        interviewType: form.interviewType,
        research: form.research,
      });
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
    setForm(EMPTY_FORM);
    setInterview(null);
    setSavedToProject(false);
    setError("");
    setNeedsUpgrade(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">🗣️ Preparar entrevista</h1>
        <p className="mt-1 text-sm text-brand-text/70">
          Recibe un kit completo de preguntas antes de tu próxima entrevista.
        </p>
      </div>

      {!interview && <InterviewForm values={form} onChange={setForm} onSubmit={handlePrepare} disabled={preparing} />}

      {error && <p className="text-sm text-brand-error">{error}</p>}
      {needsUpgrade && <UpgradePrompt />}

      {preparing && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">
            {form.research
              ? "Investigando al entrevistado y preparando tus preguntas... puede tardar hasta un minuto."
              : "Preparando tus preguntas..."}
          </span>
        </div>
      )}

      {interview && !preparing && (
        <>
          <div>
            <h2 className="text-lg font-bold text-brand-text">Entrevista a {interview.interviewee}</h2>
            <p className="text-sm text-brand-text/70">{interview.topic}</p>
          </div>
          <InterviewResults
            interviewee={interview.interviewee}
            topic={interview.topic}
            results={interview.results}
            onVerifyFact={handleVerifyFact}
          />
          <NextStepsPanel
            actions={[
              { emoji: "🎙️", label: "Ya la hice: transcribir la entrevista", onClick: () => navigate("/transcription") },
              { emoji: "💾", label: "Guardar en proyecto", onClick: () => setShowSaveModal(true) },
            ]}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => guardAction(handleReset)} className="w-full sm:w-auto">
              Nueva entrevista
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
