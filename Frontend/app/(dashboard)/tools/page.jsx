"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ToolsForm from "../../../components/tools/ToolsForm";
import ToolsResults from "../../../components/tools/ToolsResults";
import Spinner from "../../../components/ui/Spinner";
import Button from "../../../components/ui/Button";
import NextStepsPanel from "../../../components/ui/NextStepsPanel";
import { recommendWorkflow } from "../../../services/tools.service";

const FEATURE_MATCHERS = [
  { href: "/idea", emoji: "💡", label: "Tengo una idea", keywords: ["tengo una idea", "plan de investigación"] },
  { href: "/verification", emoji: "🔍", label: "Verificar fuentes", keywords: ["verificar fuentes", "verificación"] },
  {
    href: "/transcription",
    emoji: "🎙️",
    label: "De entrevista a noticia",
    keywords: ["entrevista a noticia", "transcri"],
  },
  { href: "/documents", emoji: "📄", label: "Analizar documento", keywords: ["analizar documento"] },
  { href: "/interview", emoji: "🎙️", label: "Preparar entrevista", keywords: ["preparar entrevista"] },
];

function detectRelevantFeatures(recommendation) {
  const haystack = [
    recommendation.periodista_ia_role,
    ...(recommendation.steps || []).flatMap((s) => [s.step, ...(s.tools || [])]),
  ]
    .join(" ")
    .toLowerCase();

  return FEATURE_MATCHERS.filter((feature) => feature.keywords.some((keyword) => haystack.includes(keyword)));
}

export default function ToolsPage() {
  const router = useRouter();

  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState("");

  async function handleRecommend() {
    setLoading(true);
    setError("");

    try {
      const data = await recommendWorkflow({ task: task.trim() });
      setRecommendation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setTask("");
    setRecommendation(null);
    setError("");
  }

  const relevantFeatures = recommendation ? detectRelevantFeatures(recommendation) : [];
  const nextStepsActions =
    relevantFeatures.length > 0
      ? relevantFeatures.map((f) => ({ emoji: f.emoji, label: f.label, onClick: () => router.push(f.href) }))
      : [{ emoji: "🏠", label: "Ir al inicio", onClick: () => router.push("/home") }];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">🧭 ¿Qué herramienta necesito?</h1>
        <p className="mt-1 text-sm text-brand-text/70">
          Describe tu tarea y recibe una recomendación de flujo de trabajo con herramientas.
        </p>
      </div>

      {!recommendation && <ToolsForm value={task} onChange={setTask} onSubmit={handleRecommend} disabled={loading} />}

      {error && <p className="text-sm text-brand-error">{error}</p>}

      {loading && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Armando tu flujo recomendado...</span>
        </div>
      )}

      {recommendation && !loading && (
        <>
          <ToolsResults recommendation={recommendation} />
          <NextStepsPanel actions={nextStepsActions} />
          <Button variant="secondary" onClick={handleReset} className="w-full sm:w-auto">
            Nueva consulta
          </Button>
        </>
      )}
    </div>
  );
}
