export async function listProjects() {
  const response = await fetch("/api/proxy/projects");

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos cargar tus proyectos. Intenta de nuevo.");
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function createProject({ title, description }) {
  const response = await fetch("/api/proxy/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos crear el proyecto. Intenta de nuevo.");
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function getProject(id) {
  const response = await fetch(`/api/proxy/projects/${id}`);

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos cargar el proyecto. Intenta de nuevo.");
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function deleteProject(id) {
  const response = await fetch(`/api/proxy/projects/${id}`, { method: "DELETE" });

  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    const error = new Error(data?.error || "No pudimos eliminar el proyecto. Intenta de nuevo.");
    error.status = response.status;
    throw error;
  }
}

export async function addItemToProject({ projectId, type, itemId }) {
  const response = await fetch(`/api/proxy/projects/${projectId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, item_id: itemId }),
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
