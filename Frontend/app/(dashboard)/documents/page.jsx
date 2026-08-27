"use client";

import { useState } from "react";
import DocumentUploader from "../../../components/documents/DocumentUploader";
import DocumentResults from "../../../components/documents/DocumentResults";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import SaveToProjectModal from "../../../components/projects/SaveToProjectModal";
import { analyzeDocument } from "../../../services/documents.service";
import { addItemToProject } from "../../../services/projects.service";
import { useCredits } from "../../../hooks/useCredits";

export default function DocumentsPage() {
  const { credits, refreshCredits } = useCredits();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

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
          "Tu documento supera el límite del plan gratuito (5 páginas o 50KB). Actualiza a Pro para analizar documentos más grandes."
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
    setToastMessage("Guardado en el proyecto.");
  }

  function handleReset() {
    setResult(null);
    setError("");
    setNeedsUpgrade(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">📄 Analizar documento</h1>
        <p className="mt-1 text-sm text-brand-text/70">
          Sube un PDF, Word o Excel y obtén hallazgos periodísticos clave.
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
        <DocumentResults
          analysisTypes={result.analysis_types}
          results={result.results}
          onReset={handleReset}
          onSaveToProject={() => setShowSaveModal(true)}
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
