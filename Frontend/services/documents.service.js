export async function analyzeDocument({ file, analysisTypes }) {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("analysis_types", JSON.stringify(analysisTypes));

  const response = await fetch("/api/proxy/documents", {
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
    const error = new Error(data?.error || "No pudimos analizar el documento. Intenta de nuevo.");
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }

  return data;
}
