export async function recommendWorkflow({ task }) {
  const response = await fetch("/api/proxy/tools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos recomendarte un flujo. Intenta de nuevo.");
    error.status = response.status;
    throw error;
  }

  return data.recommendation;
}
