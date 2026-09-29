"use client";

import { useState } from "react";
import { useGuardedNavigation } from "../../../context/NavigationGuardContext";
import ToolsForm from "../../../components/tools/ToolsForm";
import ToolsResults from "../../../components/tools/ToolsResults";
import Spinner from "../../../components/ui/Spinner";
import Button from "../../../components/ui/Button";
import { recommendWorkflow } from "../../../services/tools.service";
import { setPrefilledInput } from "../../../hooks/usePrefilledInput";

export default function ToolsPage() {
  const navigate = useGuardedNavigation();

  const [task, setTask] = useState("");
  const [submittedTask, setSubmittedTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState("");

  async function handleRecommend() {
    setLoading(true);
    setError("");

    try {
      const data = await recommendWorkflow({ task: task.trim() });
      setRecommendation(data);
      setSubmittedTask(task.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // "Tengo una idea" arranca con la tarea ya escrita; el resto abre la sección.
  function handleOpenFeature(feature) {
    if (feature.slug === "idea") setPrefilledInput("idea", submittedTask);
    navigate(feature.href);
  }

  function handleReset() {
    setTask("");
    setSubmittedTask("");
    setRecommendation(null);
    setError("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">🧭 ¿Qué herramienta necesito?</h1>
        <p className="mt-1 text-sm text-brand-text/70">
          Describe tu tarea y recibe un flujo de trabajo paso a paso, con lo que puedes hacer en PeriodistaIA y las
          herramientas externas que te sirven.
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
          <div className="rounded-brand bg-brand-bg px-4 py-3 text-sm text-brand-text/80">
            <span className="font-medium">Tu tarea:</span> {submittedTask}
          </div>
          <ToolsResults task={submittedTask} recommendation={recommendation} onOpenFeature={handleOpenFeature} />
          <Button variant="secondary" onClick={handleReset} className="w-full sm:w-auto">
            Nueva consulta
          </Button>
        </>
      )}
    </div>
  );
}
