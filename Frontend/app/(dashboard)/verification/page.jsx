"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClaimInput from "../../../components/verification/ClaimInput";
import VerificationResult from "../../../components/verification/VerificationResult";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import NextStepsPanel from "../../../components/ui/NextStepsPanel";
import SaveToProjectModal from "../../../components/projects/SaveToProjectModal";
import { verifyClaim } from "../../../services/sources.service";
import { addItemToProject } from "../../../services/projects.service";
import { useCredits } from "../../../hooks/useCredits";
import { usePrefilledInput, setPrefilledInput } from "../../../hooks/usePrefilledInput";
import { useUnsavedWarning } from "../../../hooks/useUnsavedWarning";

export default function VerificationPage() {
  const router = useRouter();
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedToProject, setSavedToProject] = useState(false);
  const { refreshCredits } = useCredits();
  const prefilledClaim = usePrefilledInput("verification");

  useUnsavedWarning(!!result && !savedToProject, () => setShowSaveModal(true));

  useEffect(() => {
    if (prefilledClaim) setClaim(prefilledClaim);
  }, [prefilledClaim]);

  async function handleSaveToProject(projectId) {
    await addItemToProject({ projectId, type: "source", itemId: result.id });
    setSavedToProject(true);
    setToastMessage("Guardado en el proyecto.");
  }

  function handleInvestigateFurther() {
    setPrefilledInput("idea", claim);
    router.push("/idea");
  }

  async function handleVerify() {
    setLoading(true);
    setError("");
    setNeedsUpgrade(false);

    try {
      const data = await verifyClaim(claim.trim());
      setResult(data);
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
    setClaim("");
    setResult(null);
    setSavedToProject(false);
    setError("");
    setNeedsUpgrade(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">🔍 Verificar fuentes</h1>
        <p className="mt-1 text-sm text-brand-text/70">Confirma si una afirmación tiene respaldo real.</p>
      </div>

      <ClaimInput value={claim} onChange={setClaim} onSubmit={handleVerify} disabled={loading || !!result} />

      {error && <p className="text-sm text-brand-error">{error}</p>}
      {needsUpgrade && <UpgradePrompt />}

      {loading && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Verificando afirmación...</span>
        </div>
      )}

      {result && !loading && (
        <>
          <VerificationResult result={result} />
          <NextStepsPanel
            actions={[
              { emoji: "💡", label: "Investigar más esta historia", onClick: handleInvestigateFurther },
              { emoji: "📄", label: "Analizar un documento relacionado", onClick: () => router.push("/documents") },
              { emoji: "💾", label: "Guardar en proyecto", onClick: () => setShowSaveModal(true) },
            ]}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={handleReset} className="w-full sm:w-auto">
              Nueva verificación
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
