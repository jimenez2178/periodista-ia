async function request(path, { method = "POST", body, fallbackError }) {
  const response = await fetch(`/api/proxy/ideas${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || fallbackError);
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }

  return data;
}

// Devuelve { session_id, plan }: la idea queda guardada en el historial desde ya.
export function generateInvestigationPlan(idea) {
  return request("", { body: { idea }, fallbackError: "No pudimos generar tu plan. Intenta de nuevo." });
}

export function refineInvestigationPlan(sessionId, { instruction, angle }) {
  return request(`/${sessionId}/refine`, {
    body: { instruction, angle },
    fallbackError: "No pudimos ajustar tu plan. Intenta de nuevo.",
  });
}

export function saveStepProgress(sessionId, completedSteps) {
  return request(`/${sessionId}/progress`, {
    method: "PATCH",
    body: { completed_steps: completedSteps },
    fallbackError: "No pudimos guardar tu avance.",
  });
}

// kind: "pitch" | "skeleton" | "reported". Devuelve el texto ya guardado (con id).
export function generateIdeaDraft(sessionId, { kind, angle, reporting }) {
  return request(`/${sessionId}/draft`, {
    body: { kind, angle, reporting },
    fallbackError: "No pudimos redactar el texto. Intenta de nuevo.",
  });
}

// Reabre una idea guardada: { session_id, idea, plan, project_id }.
export function getIdea(sessionId) {
  return request(`/${sessionId}`, { method: "GET", fallbackError: "No pudimos abrir la idea." });
}
