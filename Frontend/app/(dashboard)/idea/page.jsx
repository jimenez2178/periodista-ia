"use client";

import { useEffect, useState } from "react";
import { useGuardedAction, useGuardedNavigation } from "../../../context/NavigationGuardContext";
import IdeaInput from "../../../components/idea/IdeaInput";
import InvestigationPlan from "../../../components/idea/InvestigationPlan";
import PlanRefiner from "../../../components/idea/PlanRefiner";
import IdeaOutputs, { OUTPUT_KINDS } from "../../../components/idea/IdeaOutputs";
import ArticleResult from "../../../components/transcription/ArticleResult";
import SocialSharePanel from "../../../components/social/SocialSharePanel";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import SaveToProjectModal from "../../../components/projects/SaveToProjectModal";
import {
  generateInvestigationPlan,
  refineInvestigationPlan,
  saveStepProgress,
  generateIdeaDraft,
} from "../../../services/ideas.service";
import { addItemToProject } from "../../../services/projects.service";
import { useCredits } from "../../../hooks/useCredits";
import { usePrefilledInput, setPrefilledInput } from "../../../hooks/usePrefilledInput";
import { useUnsavedWarning } from "../../../hooks/useUnsavedWarning";

export default function IdeaPage() {
  const navigate = useGuardedNavigation();
  const guardAction = useGuardedAction();
  const { refreshCredits } = useCredits();
  const prefilledIdea = usePrefilledInput("idea");

  const [idea, setIdea] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [plan, setPlan] = useState(null);
  const [selectedAngle, setSelectedAngle] = useState("");
  const [savedToProject, setSavedToProject] = useState(false);

  // Operación en curso: "plan" | "refine" | "draft" | null.
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);

  // Último texto producido (pitch, esqueleto o nota); los anteriores quedan en el historial.
  const [draft, setDraft] = useState(null);
  const [draftKind, setDraftKind] = useState(null);
  const [draftSavedToProject, setDraftSavedToProject] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  const hasUnsaved = (!!plan && !savedToProject) || (!!draft && !draftSavedToProject);

  // Guarda en el proyecto todo lo pendiente: la idea con su plan y el último texto.
  async function handleSaveToProject(projectId) {
    if (plan && !savedToProject) {
      await addItemToProject({ projectId, type: "idea", itemId: sessionId });
      setSavedToProject(true);
    }
    if (draft && !draftSavedToProject) {
      await addItemToProject({ projectId, type: "article", itemId: draft.id });
      setDraftSavedToProject(true);
    }
    setToastMessage("Guardado en el proyecto.");
  }

  useUnsavedWarning(hasUnsaved, handleSaveToProject);

  useEffect(() => {
    if (prefilledIdea) setIdea(prefilledIdea);
  }, [prefilledIdea]);

  function handleError(err) {
    if (err.status === 402) setNeedsUpgrade(true);
    else setError(err.message);
  }

  async function run(kind, operation) {
    setBusy(kind);
    setError("");
    setNeedsUpgrade(false);
    try {
      return await operation();
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function handleGenerate() {
    await run("plan", async () => {
      const result = await generateInvestigationPlan(idea.trim());
      setSessionId(result.session_id);
      setPlan(result.plan);
      refreshCredits();
    });
  }

  async function handleRefine(instruction) {
    const result = await run("refine", async () => {
      const refined = await refineInvestigationPlan(sessionId, { instruction, angle: selectedAngle });
      setPlan(refined.plan);
      refreshCredits();
      return refined;
    });
    return !!result;
  }

  async function handleToggleStep(index) {
    const previous = plan;
    const completed = plan.completed_steps || [];
    const next = completed.includes(index) ? completed.filter((i) => i !== index) : [...completed, index];
    setPlan({ ...plan, completed_steps: next });

    try {
      await saveStepProgress(sessionId, next);
    } catch (err) {
      setPlan(previous);
      setError(err.message);
    }
  }

  async function handleGenerateDraft({ kind, reporting }) {
    setDraft(null);
    await run("draft", async () => {
      const saved = await generateIdeaDraft(sessionId, { kind, angle: selectedAngle, reporting });
      setDraft(saved);
      setDraftKind(kind);
      setDraftSavedToProject(false);
      refreshCredits();
    });
  }

  function handlePrepareInterview(source) {
    // "Preparar entrevista" acepta hasta 300 caracteres de entrevistado y 500 de tema.
    const topic = (selectedAngle || idea.trim()).slice(0, 500);
    setPrefilledInput("interview", JSON.stringify({ interviewee: source.slice(0, 300), topic }));
    navigate("/interview");
  }

  function handleReset() {
    setIdea("");
    setSessionId(null);
    setPlan(null);
    setSelectedAngle("");
    setSavedToProject(false);
    setDraft(null);
    setDraftKind(null);
    setDraftSavedToProject(false);
    setError("");
    setNeedsUpgrade(false);
  }

  const draftMeta = OUTPUT_KINDS.find((option) => option.kind === draftKind);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">💡 Tengo una idea</h1>
        <p className="mt-1 text-sm text-brand-text/70">
          Convierte una observación en un plan de investigación, ajústalo y produce tu pitch o tu nota.
        </p>
      </div>

      <IdeaInput value={idea} onChange={setIdea} onSubmit={handleGenerate} disabled={!!busy || !!plan} />

      {error && <p className="text-sm text-brand-error">{error}</p>}
      {needsUpgrade && <UpgradePrompt />}

      {busy === "plan" && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Generando tu plan...</span>
        </div>
      )}

      {plan && (
        <>
          {busy === "refine" ? (
            <div className="flex items-center justify-center gap-3 py-8">
              <Spinner />
              <span className="text-brand-text/70">Ajustando tu plan...</span>
            </div>
          ) : (
            <InvestigationPlan
              plan={plan}
              selectedAngle={selectedAngle}
              onSelectAngle={setSelectedAngle}
              onToggleStep={handleToggleStep}
              onPrepareInterview={handlePrepareInterview}
              onAnalyzeDocument={() => navigate("/documents")}
              disabled={!!busy}
            />
          )}

          <PlanRefiner selectedAngle={selectedAngle} onRefine={handleRefine} disabled={!!busy} />

          <IdeaOutputs onGenerate={handleGenerateDraft} disabled={!!busy} />

          {busy === "draft" && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Spinner />
              <span className="text-brand-text/70">Redactando...</span>
            </div>
          )}

          {draft && busy !== "draft" && (
            <div className="flex flex-col gap-3">
              {draftMeta && (
                <h3 className="font-semibold text-brand-text">
                  {draftMeta.emoji} {draftMeta.title}
                </h3>
              )}
              <ArticleResult article={draft} onArticleChange={setDraft} />
              {draftKind === "reported" && <SocialSharePanel content={draft.body} contentType="article" />}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => guardAction(handleReset)} className="w-full sm:w-auto">
              Nueva idea
            </Button>
            <Button
              onClick={() => setShowSaveModal(true)}
              disabled={!hasUnsaved || !!busy}
              className="w-full sm:w-auto"
            >
              {hasUnsaved ? "Guardar en proyecto →" : "✓ Guardado en proyecto"}
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
