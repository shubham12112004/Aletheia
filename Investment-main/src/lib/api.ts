const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function postResearch(payload: unknown) {
  const response = await fetch(`${API_URL}/api/research`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message ?? "Research request failed");
  }

  return data;
}


export async function postGoogleLogin(idToken: string, turnstileToken: string) {
  const response = await fetch(`${API_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, turnstileToken }),
  });
  const payload = await response.json();
  if (!response.ok || payload.success === false) throw new Error(payload.message ?? 'Google sign-in failed.');
  return payload.data as { token: string; user: { email: string; name?: string } };
}
export async function verifyTurnstile(turnstileToken: string) {
  const response = await fetch(`${API_URL}/api/auth/verify-turnstile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turnstileToken }),
  });

  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message ?? 'Cloudflare verification failed.');
  }
}

export async function postChatQuery(payload: unknown) {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message ?? "Chat request failed");
  }

  return data;
}

export { API_URL };