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

// Devuelve { approve_url }: la página de PayPal donde el usuario aprueba el cobro mensual.
export async function startSubscription() {
  const response = await fetch("/api/proxy/subscriptions/start", { method: "POST" });
  return parseResponse(response);
}

// Al volver de PayPal. Devuelve { status: "active" | "pending" | ... }.
export async function confirmSubscription(subscriptionId) {
  const response = await fetch("/api/proxy/subscriptions/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription_id: subscriptionId }),
  });
  return parseResponse(response);
}

export async function cancelSubscription() {
  const response = await fetch("/api/proxy/subscriptions/cancel", { method: "POST" });
  return parseResponse(response);
}
