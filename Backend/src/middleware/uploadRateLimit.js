// Limite de subidas por usuario: cada subida procesa un archivo de hasta 25 MB
// en memoria y llama a la IA, asi que se corta el abuso antes de leer el archivo.
// Cuenta igual por el proxy de Vercel que por la subida directa.
const MAX_UPLOADS_PER_MINUTE = 6;
const WINDOW_MS = 60 * 1000;

const recentUploadsByUser = new Map();

function uploadRateLimit(req, res, next) {
  const now = Date.now();
  const userId = req.user.id;
  const recent = (recentUploadsByUser.get(userId) || []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_UPLOADS_PER_MINUTE) {
    const retryAfterSecs = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    res.set("Retry-After", String(retryAfterSecs));
    return res.status(429).json({
      error: `Subiste muchos archivos seguidos. Espera ${retryAfterSecs} segundos e inténtalo de nuevo.`,
      code: "TOO_MANY_UPLOADS",
    });
  }

  recent.push(now);
  recentUploadsByUser.set(userId, recent);

  // Limpieza para que el mapa no crezca con usuarios inactivos.
  if (recentUploadsByUser.size > 1000) {
    for (const [id, times] of recentUploadsByUser) {
      if (!times.some((time) => now - time < WINDOW_MS)) recentUploadsByUser.delete(id);
    }
  }

  next();
}

module.exports = uploadRateLimit;
