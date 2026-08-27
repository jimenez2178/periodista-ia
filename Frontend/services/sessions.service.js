export async function saveIdeaSession({ idea, plan, projectId }) {
  const response = await fetch("/api/proxy/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, plan, project_id: projectId }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos guardar tu idea. Intenta de nuevo.");
    error.status = response.status;
    throw error;
  }

  return data;
}
