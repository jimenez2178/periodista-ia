const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // límite de la API de Whisper

function normalizeAudioUrl(url) {
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }
  return url;
}

async function downloadAudioFromUrl(url) {
  const normalizedUrl = normalizeAudioUrl(url);

  let response;
  try {
    response = await fetch(normalizedUrl);
  } catch {
    throw Object.assign(new Error("No pudimos descargar el audio desde ese enlace."), { status: 400 });
  }

  if (!response.ok) {
    throw Object.assign(new Error("No pudimos descargar el audio desde ese enlace."), { status: 400 });
  }

  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length > MAX_AUDIO_BYTES) {
    throw Object.assign(new Error("El archivo de audio es demasiado grande (máx. 25MB)."), { status: 400 });
  }

  return { buffer, contentType };
}

module.exports = { downloadAudioFromUrl, MAX_AUDIO_BYTES };
