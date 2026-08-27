export async function generateSocialCopy({ content, platform, contentType }) {
  const response = await fetch("/api/proxy/social", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, platform, content_type: contentType }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos generar el copy para redes sociales. Intenta de nuevo.");
    error.status = response.status;
    throw error;
  }

  return data.copy;
}
