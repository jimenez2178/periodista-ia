export async function sendAssistantMessage(message, history) {
  const response = await fetch("/api/proxy/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos responder. Intenta de nuevo.");
    error.status = response.status;
    throw error;
  }

  return data.reply;
}
