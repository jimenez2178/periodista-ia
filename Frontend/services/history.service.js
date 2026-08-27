export async function listHistory() {
  const response = await fetch("/api/proxy/history");

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos cargar tu historial. Intenta de nuevo.");
    error.status = response.status;
    throw error;
  }

  return data;
}
