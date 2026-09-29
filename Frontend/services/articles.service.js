export async function generateArticle(payload) {
  const response = await fetch("/api/proxy/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos generar la nota. Intenta de nuevo.");
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }

  return data;
}

export async function updateArticle(id, { title, body }, { keepalive = false } = {}) {
  const response = await fetch(`/api/proxy/articles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body }),
    keepalive,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos guardar los cambios de la nota.");
    error.status = response.status;
    throw error;
  }

  return data;
}
