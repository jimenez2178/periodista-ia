export async function generateNoteFromDocument({ file, text, format, organizationName, tone, length }) {
  let response;

  if (file) {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("format", format);
    if (organizationName) formData.append("organization_name", organizationName);
    formData.append("tone", tone);
    formData.append("length", length);

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

export async function saveNoteToProject({ title, body, format, organizationName, projectId }) {
  const response = await fetch("/api/proxy/doc-to-note/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      body,
      format,
      organization_name: organizationName,
      project_id: projectId,
    }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos guardar en el proyecto. Intenta de nuevo.");
    error.status = response.status;
    throw error;
  }

  return data;
}
