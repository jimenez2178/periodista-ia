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

export async function getCredits() {
  const response = await fetch("/api/proxy/credits");
  return parseResponse(response);
}
