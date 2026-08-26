export async function transcribe({ file, url }) {
  const formData = new FormData();
  if (file) formData.append("audio", file);
  if (url) formData.append("url", url);

  const response = await fetch("/api/proxy/transcriptions", {
    method: "POST",
    body: formData,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos transcribir el audio. Intenta de nuevo.");
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }

  return data;
}
