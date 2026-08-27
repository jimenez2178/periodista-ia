import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const COOKIE_NAME = "pia_session";

async function forward(request, pathSegments) {
  const path = pathSegments.join("/");

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const method = request.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  const incomingContentType = request.headers.get("content-type") || "";
  const isMultipart = incomingContentType.startsWith("multipart/form-data");

  let body;
  if (hasBody) {
    if (isMultipart) {
      // Los archivos (ej. audio) van como stream binario, con el
      // Content-Type original (boundary incluido) — request.text()
      // corrompería los bytes binarios.
      headers["Content-Type"] = incomingContentType;
      body = request.body;
    } else {
      headers["Content-Type"] = "application/json";
      body = await request.text();
    }
  }

  let backendResponse;
  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/${path}`, {
      method,
      headers,
      body,
      duplex: isMultipart ? "half" : undefined,
    });
  } catch {
    return NextResponse.json({ error: "No se pudo conectar con el servidor." }, { status: 502 });
  }

  // El backend responde 204 sin cuerpo en logout; un Response no puede
  // llevar body con ese status.
  if (backendResponse.status === 204) {
    const response = new NextResponse(null, { status: 204 });
    if (path === "auth/logout") response.cookies.delete(COOKIE_NAME);
    return response;
  }

  const contentType = backendResponse.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await backendResponse.json().catch(() => null)
    : null;

  // La sesión (access_token) nunca debe llegar al navegador: se queda en
  // una cookie httpOnly que solo este servidor puede leer.
  let session = null;
  if (data && data.session) {
    session = data.session;
    delete data.session;
  }

  const response = NextResponse.json(data, { status: backendResponse.status });

  if (session && session.access_token) {
    response.cookies.set(COOKIE_NAME, session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: session.expires_in || 3600,
    });
  }

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
