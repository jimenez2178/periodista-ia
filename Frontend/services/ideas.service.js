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

// Si el backend responde sin { session_id, plan } (ej. un backend local sin
// reiniciar con una versión anterior), se avisa en vez de quedar en blanco.
function requirePlan(data) {
  if (!data?.session_id || !data?.plan) {
    throw new Error(
      "El servidor respondió en un formato inesperado y no pudimos mostrar el plan. Recarga la página e inténtalo de nuevo; si sigue pasando, avísanos."
    );
  }
  return data;
}

// Devuelve { session_id, plan }: la idea queda guardada en el historial desde ya.
export async function generateInvestigationPlan(idea) {
  return requirePlan(
    await request("", { body: { idea }, fallbackError: "No pudimos generar tu plan. Intenta de nuevo." })
  );
}

export async function refineInvestigationPlan(sessionId, { instruction, angle }) {
  return requirePlan(await request(`/${sessionId}/refine`, {
    body: { instruction, angle },
    fallbackError: "No pudimos ajustar tu plan. Intenta de nuevo.",
  }));
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
export async function getIdea(sessionId) {
  return requirePlan(await request(`/${sessionId}`, { method: "GET", fallbackError: "No pudimos abrir la idea." }));
}
