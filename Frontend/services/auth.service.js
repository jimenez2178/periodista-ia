async function parseResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    throw new Error(data?.error || "Ocurrió un error inesperado.");
  }
  return data;
}

export async function register({ email, password, full_name, country }) {
  const response = await fetch("/api/proxy/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name, country }),
  });
  return parseResponse(response);
}

export async function login(email, password) {
  const response = await fetch("/api/proxy/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseResponse(response);
}

export async function logout() {
  const response = await fetch("/api/proxy/auth/logout", { method: "POST" });
  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "No se pudo cerrar sesión.");
  }
}

export async function me() {
  const response = await fetch("/api/proxy/auth/me");
  return parseResponse(response);
}
