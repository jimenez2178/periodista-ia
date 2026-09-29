export async function generateNoteFromDocument({ file, text, format, organizationName, tone, length, angle }) {
  let response;

  if (file) {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("format", format);
    if (organizationName) formData.append("organization_name", organizationName);
    formData.append("tone", tone);
    formData.append("length", length);
    if (angle) formData.append("angle", angle);

    response = await fetch("/api/proxy/doc-to-note", {
      method: "POST",
      body: formData,
    });
  } else {
    response = await fetch("/api/proxy/doc-to-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        format,
        organization_name: organizationName,
        tone,
        length,
        angle,
      }),
    });
  }

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
