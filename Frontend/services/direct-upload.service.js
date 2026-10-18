// Vercel no deja pasar peticiones de mas de 4,5 MB, asi que los archivos van
// directo al backend. La sesion no sale de la cookie httpOnly: primero se pide
// por el proxy un pase de subida (un solo uso, 5 minutos, solo para esta
// accion) y con el se manda el archivo.
const PROXY_MAX_BYTES = 4 * 1024 * 1024;

async function requestUploadTicket(action) {
  try {
    const response = await fetch("/api/proxy/uploads/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function sendThroughProxy(action, formData) {
  return fetch(`/api/proxy/${action}`, { method: "POST", body: formData });
}

// action: "doc-to-note" | "documents" | "transcriptions". Devuelve el Response
// del backend, igual que si se hubiera llamado al proxy.
export async function uploadFile(action, formData, fileSize) {
  const ticket = await requestUploadTicket(action);

  // Sin pase (subida directa apagada o sesion vencida) se usa el proxy de
  // siempre: los archivos chicos pasan y, si la sesion vencio, el proxy lo explica.
  if (!ticket?.ticket || !ticket?.upload_url) return sendThroughProxy(action, formData);

  try {
    return await fetch(ticket.upload_url, {
      method: "POST",
      headers: { "X-Upload-Ticket": ticket.ticket },
      body: formData,
    });
  } catch {
    // El backend no respondio (red, CORS). Un archivo chico aun cabe por el proxy.
    if (fileSize <= PROXY_MAX_BYTES) return sendThroughProxy(action, formData);
    const error = new Error("No pudimos conectar con el servidor para subir el archivo. Revisa tu conexión e intenta de nuevo.");
    error.status = 0;
    throw error;
  }
}
