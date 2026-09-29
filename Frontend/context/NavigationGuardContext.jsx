"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUnsavedWarningState } from "../hooks/useUnsavedWarning";
import UnsavedWarningModal from "../components/ui/UnsavedWarningModal";
import SaveToProjectModal from "../components/projects/SaveToProjectModal";

const NavigationGuardContext = createContext(null);

// Toda acción que haría perder los resultados de la página (ir a otra sección,
// o "Nuevo análisis"/"Nueva nota" en la misma) pasa por aquí: si hay resultados
// sin guardar, se avisa y se ofrece guardarlos en un proyecto y luego continuar.
export function NavigationGuardProvider({ children }) {
  const router = useRouter();
  // Se guarda como { run } porque setState con una función la ejecutaría.
  const [pendingAction, setPendingAction] = useState(null);
  const [savingBeforeLeave, setSavingBeforeLeave] = useState(false);

  const guard = useCallback((action) => {
    if (getUnsavedWarningState().hasUnsavedResults) {
      setPendingAction({ run: action });
      return;
    }
    action();
  }, []);

  const navigate = useCallback((href) => guard(() => router.push(href)), [guard, router]);

  function runPendingAction() {
    const action = pendingAction;
    setSavingBeforeLeave(false);
    setPendingAction(null);
    action?.run();
  }

  async function handleSaveAndContinue(projectId) {
    const { saveToProject } = getUnsavedWarningState();
    if (saveToProject) await saveToProject(projectId);
    runPendingAction();
  }

  const value = useMemo(() => ({ guard, navigate }), [guard, navigate]);

  return (
    <NavigationGuardContext.Provider value={value}>
      {children}

      <UnsavedWarningModal
        open={!!pendingAction && !savingBeforeLeave}
        onClose={() => setPendingAction(null)}
        onSave={() => setSavingBeforeLeave(true)}
        onDiscard={runPendingAction}
      />

      <SaveToProjectModal
        open={savingBeforeLeave}
        onClose={() => setSavingBeforeLeave(false)}
        onConfirm={handleSaveAndContinue}
      />
    </NavigationGuardContext.Provider>
  );
}

function useNavigationGuardContext() {
  const context = useContext(NavigationGuardContext);
  if (!context) throw new Error("Debe usarse dentro de NavigationGuardProvider.");
  return context;
}

// Navega a otra ruta del dashboard, avisando si hay resultados sin guardar.
export function useGuardedNavigation() {
  return useNavigationGuardContext().navigate;
}

// Envuelve una acción que descarta los resultados (ej. "Nuevo análisis").
export function useGuardedAction() {
  return useNavigationGuardContext().guard;
}
