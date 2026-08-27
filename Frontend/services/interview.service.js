export async function createInterviewKit({ interviewee, topic }) {
  const response = await fetch("/api/proxy/interviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interviewee, topic }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos preparar tu kit de entrevista. Intenta de nuevo.");
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }

  return data;
}
