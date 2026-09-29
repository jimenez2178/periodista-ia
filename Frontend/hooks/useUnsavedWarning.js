"use client";

import { useEffect } from "react";

// Estado de la página activa: si tiene resultados sin guardar en un proyecto y
// cómo guardarlos. Lo lee NavigationGuardProvider al navegar (menú lateral o
// botones como "Verificar"), para avisar antes de salir y poder guardar y continuar.
const state = {
  hasUnsavedResults: false,
  saveToProject: null,
};

function warnBeforeUnload(e) {
  e.preventDefault();
  // Algunos navegadores solo muestran el aviso nativo si returnValue tiene valor.
  e.returnValue = "";
}

// `saveToProject(projectId)` guarda en ese proyecto todo lo que la página tenga
// pendiente y debe lanzar un error si no pudo guardar.
export function useUnsavedWarning(hasUnsavedResults, saveToProject) {
  useEffect(() => {
    state.hasUnsavedResults = hasUnsavedResults;
    state.saveToProject = saveToProject;

    // Recargar o cerrar la pestaña también pierde los resultados.
    if (hasUnsavedResults) window.addEventListener("beforeunload", warnBeforeUnload);

    return () => {
      state.hasUnsavedResults = false;
      state.saveToProject = null;
      window.removeEventListener("beforeunload", warnBeforeUnload);
    };
  }, [hasUnsavedResults, saveToProject]);
}

export function getUnsavedWarningState() {
  return state;
}
