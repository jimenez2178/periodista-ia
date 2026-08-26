export async function verifyClaim(claim) {
  const response = await fetch("/api/proxy/sources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claim }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos verificar la afirmación. Intenta de nuevo.");
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }

  return data;
}
