"use client";

import { useState } from "react";
import IdeaInput from "../../../components/idea/IdeaInput";
import InvestigationPlan from "../../../components/idea/InvestigationPlan";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import { generateInvestigationPlan } from "../../../services/ideas.service";
import { useCredits } from "../../../hooks/useCredits";

export default function IdeaPage() {
  const [idea, setIdea] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { refreshCredits } = useCredits();

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
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={handleReset} className="w-full sm:w-auto">
              Nueva idea
            </Button>
            <Button onClick={() => setToastMessage("Próximamente")} className="w-full sm:w-auto">
              Guardar en proyecto →
            </Button>
          </div>
        </>
      )}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage("")} />}
    </div>
  );
}
