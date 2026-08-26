export async function updateProfile(formData) {
  const response = await fetch("/api/proxy/users/profile", {
    method: "PATCH",
    body: formData,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos guardar tu perfil. Intenta de nuevo.");
    error.status = response.status;
    throw error;
  }

  return data;
}
