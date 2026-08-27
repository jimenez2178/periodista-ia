"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import IdeaInput from "../../../components/idea/IdeaInput";
import InvestigationPlan from "../../../components/idea/InvestigationPlan";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import NextStepsPanel from "../../../components/ui/NextStepsPanel";
import SaveToProjectModal from "../../../components/projects/SaveToProjectModal";
import { generateInvestigationPlan } from "../../../services/ideas.service";
import { saveIdeaSession } from "../../../services/sessions.service";
import { useCredits } from "../../../hooks/useCredits";
import { usePrefilledInput, setPrefilledInput } from "../../../hooks/usePrefilledInput";

export default function IdeaPage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { refreshCredits } = useCredits();
  const prefilledIdea = usePrefilledInput("idea");

  useEffect(() => {
    if (prefilledIdea) setIdea(prefilledIdea);
  }, [prefilledIdea]);

  async function handleSaveToProject(projectId) {
    await saveIdeaSession({ idea: idea.trim(), plan, projectId });
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

  function handleReset() {
    setIdea("");
    setPlan(null);
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
          <NextStepsPanel
            actions={[
              { emoji: "🔍", label: "Verificar una afirmación", onClick: handleVerifyClaim },
              { emoji: "📄", label: "Analizar un documento", onClick: () => router.push("/documents") },
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

      <SaveToProjectModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSaveToProject}
      />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage("")} />}
    </div>
  );
}
