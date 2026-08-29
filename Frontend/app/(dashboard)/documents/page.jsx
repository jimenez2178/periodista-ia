"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DocumentUploader from "../../../components/documents/DocumentUploader";
import DocumentResults from "../../../components/documents/DocumentResults";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import NextStepsPanel from "../../../components/ui/NextStepsPanel";
import SaveToProjectModal from "../../../components/projects/SaveToProjectModal";
import SocialSharePanel from "../../../components/social/SocialSharePanel";
import { analyzeDocument } from "../../../services/documents.service";
import { addItemToProject } from "../../../services/projects.service";
import { useCredits } from "../../../hooks/useCredits";
import { setPrefilledInput } from "../../../hooks/usePrefilledInput";
import { useUnsavedWarning } from "../../../hooks/useUnsavedWarning";

const FALLBACK_LIST_SLUGS = ["budget_and_finances", "people_and_institutions", "dates_and_timeline", "contradictions"];

function buildDocumentContentText(analysisTypes, results) {
  return (analysisTypes || [])
    .map((slug) => {
      const value = results[slug];
      const text = Array.isArray(value) ? value.map((item) => JSON.stringify(item)).join("\n") : value;
      return `${slug}:\n${text}`;
    })
    .join("\n\n");
}

function pickPrefillText(results) {
  if (results.key_data_points?.[0]) return results.key_data_points[0];

  for (const slug of FALLBACK_LIST_SLUGS) {
    if (results[slug]?.[0]) return results[slug][0];
  }

  if (results.executive_summary) {
    const firstSentence = results.executive_summary.split(/(?<=[.!?])\s+/)[0];
    return firstSentence || results.executive_summary;
  }

  return "";
}

export default function DocumentsPage() {
  const router = useRouter();
  const { credits, refreshCredits } = useCredits();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedToProject, setSavedToProject] = useState(false);

  useUnsavedWarning(!!result && !savedToProject, () => setShowSaveModal(true));

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

  function handleVerifyClaim() {
    setPrefilledInput("verification", pickPrefillText(result.results));
    router.push("/verification");
  }

  function handleTurnIntoIdea() {
    setPrefilledInput("idea", result.results.executive_summary || pickPrefillText(result.results));
    router.push("/idea");
  }

  function handleReset() {
    setResult(null);
    setSavedToProject(false);
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
        <>
          <DocumentResults analysisTypes={result.analysis_types} results={result.results} />
          <SocialSharePanel
            content={buildDocumentContentText(result.analysis_types, result.results)}
            contentType="document_analysis"
          />
          <NextStepsPanel
            actions={[
              { emoji: "🔍", label: "Verificar una afirmación del documento", onClick: handleVerifyClaim },
              { emoji: "💡", label: "Convertir en plan de investigación", onClick: handleTurnIntoIdea },
              { emoji: "💾", label: "Guardar en proyecto", onClick: () => setShowSaveModal(true) },
            ]}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={handleReset} className="w-full sm:w-auto">
              Nuevo análisis
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
