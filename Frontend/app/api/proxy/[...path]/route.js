import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const COOKIE_NAME = "pia_session";
const REFRESH_COOKIE_NAME = "pia_refresh";
// Las cookies duran lo que el refresh token: el token de acceso vence a la hora,
// pero el proxy lo renueva solo mientras exista el refresh token.
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
// Se renueva un poco antes de que venza, para que no expire a mitad de una petición larga.
const REFRESH_MARGIN_SECONDS = 120;

const SESSION_EXPIRED_MESSAGE =
  "Tu sesión expiró. Abre PeriodistaIA en otra pestaña, inicia sesión y vuelve aquí: tus resultados siguen en esta pantalla.";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_COOKIE_MAX_AGE,
};

// Lee la expiración (exp, en segundos) del JWT sin verificarlo: solo sirve para
// decidir si conviene renovar; quien valida el token es el backend.
function tokenExpiresSoon(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return !payload.exp || payload.exp - Date.now() / 1000 < REFRESH_MARGIN_SECONDS;
  } catch {
    return true;
  }
}

async function refreshSession(refreshToken) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.session?.access_token ? data.session : null;
  } catch {
    return null;
  }
}

function setSessionCookies(response, session) {
  response.cookies.set(COOKIE_NAME, session.access_token, COOKIE_OPTIONS);
  if (session.refresh_token) response.cookies.set(REFRESH_COOKIE_NAME, session.refresh_token, COOKIE_OPTIONS);
}

function clearSessionCookies(response) {
  response.cookies.delete(COOKIE_NAME);
  response.cookies.delete(REFRESH_COOKIE_NAME);
}

async function forward(request, pathSegments) {
  const path = pathSegments.join("/");

  // La renovación es interna del proxy: el navegador nunca ve el refresh token.
  if (path === "auth/refresh") {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }

  const cookieStore = await cookies();
  let token = cookieStore.get(COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  // Sesión renovada en esta petición (hay que guardarla en las cookies de la respuesta).
  let renewedSession = null;
  if (refreshToken && (!token || tokenExpiresSoon(token))) {
    renewedSession = await refreshSession(refreshToken);
    if (renewedSession) token = renewedSession.access_token;
  }

  const method = request.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  const incomingContentType = request.headers.get("content-type") || "";
  const isMultipart = incomingContentType.startsWith("multipart/form-data");

  let body;
  const baseHeaders = {};
  if (hasBody) {
    if (isMultipart) {
      // Los archivos (ej. audio) van como stream binario, con el
      // Content-Type original (boundary incluido) — request.text()
      // corrompería los bytes binarios.
      baseHeaders["Content-Type"] = incomingContentType;
      body = request.body;
    } else {
      baseHeaders["Content-Type"] = "application/json";
      body = await request.text();
    }
  }

  function send(accessToken) {
    const headers = { ...baseHeaders };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return fetch(`${BACKEND_URL}/api/${path}`, {
      method,
      headers,
      body,
      duplex: isMultipart ? "half" : undefined,
    });
  }

  let backendResponse;
  try {
    backendResponse = await send(token);

    // El token pudo invalidarse aunque no estuviera por vencer: se renueva y se
    // reintenta una vez. Un stream multipart ya se consumió y no se puede reenviar.
    if (backendResponse.status === 401 && refreshToken && !renewedSession && !isMultipart) {
      renewedSession = await refreshSession(refreshToken);
      if (renewedSession) backendResponse = await send(renewedSession.access_token);
    }
  } catch {
    return NextResponse.json({ error: "No se pudo conectar con el servidor." }, { status: 502 });
  }

  // El backend responde 204 sin cuerpo (ej. logout); un Response no puede
  // llevar body con ese status.
  if (backendResponse.status === 204) {
    const response = new NextResponse(null, { status: 204 });
    if (path === "auth/logout") clearSessionCookies(response);
    else if (renewedSession) setSessionCookies(response, renewedSession);
    return response;
  }

  const contentType = backendResponse.headers.get("content-type") || "";
  let data = contentType.includes("application/json") ? await backendResponse.json().catch(() => null) : null;

  // La sesión (tokens) nunca debe llegar al navegador: se queda en cookies
  // httpOnly que solo este servidor puede leer.
  let session = renewedSession;
  if (data && data.session) {
    session = data.session;
    delete data.session;
  }

  // Sin sesión válida (ni renovable) el mensaje del backend ("Falta el token...")
  // no le dice nada al periodista; se le explica qué hacer sin perder su trabajo.
  const sessionLost = backendResponse.status === 401 && !path.startsWith("auth/") && !session;
  if (sessionLost) data = { error: SESSION_EXPIRED_MESSAGE, code: "SESSION_EXPIRED" };

  const response = NextResponse.json(data, { status: backendResponse.status });

  if (session?.access_token) setSessionCookies(response, session);
  else if (sessionLost) clearSessionCookies(response);

  return response;
}

export async function GET(request, { params }) {
  const { path } = await params;
  return forward(request, path);
}

export async function POST(request, { params }) {
  const { path } = await params;
  return forward(request, path);
}

export async function PATCH(request, { params }) {
  const { path } = await params;
  return forward(request, path);
}

export async function DELETE(request, { params }) {
  const { path } = await params;
  return forward(request, path);
}
