const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function authHeaders(token: string | null) {
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
}

export async function postResearch(payload: unknown) {
  const response = await fetch(`${API_URL}/api/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

export async function postSignup(payload: unknown) {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Sign-up failed.');
  return data.data as { token: string; user: { email: string; name: string } };
}

export async function postEmailLogin(payload: unknown) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Sign-in failed.');
  return data.data as { token: string; user: { email: string; name: string } };
}

export async function postForgotPassword(payload: unknown) {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Password reset failed.');
  return data.data as { tempPassword?: string };
}

export async function postUpdateProfile(payload: unknown, token: string | null) {
  const response = await fetch(`${API_URL}/api/auth/update-profile`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Profile update failed.');
  return data.data as { user: { email: string; name: string } };
}

export async function postUpdatePassword(payload: unknown, token: string | null) {
  const response = await fetch(`${API_URL}/api/auth/update-password`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Password update failed.');
  return data;
}

export async function deleteAccount(token: string | null) {
  const response = await fetch(`${API_URL}/api/auth/delete-account`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Account deletion failed.');
  return data;
}

export async function getWatchlist(token: string | null) {
  const response = await fetch(`${API_URL}/api/watchlist`, {
    method: 'GET',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Failed to fetch watchlist.');
  return data.data as Array<{ ticker: string; name: string }>;
}

export async function addToWatchlist(payload: { ticker: string; name: string }, token: string | null) {
  const response = await fetch(`${API_URL}/api/watchlist`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Failed to add to watchlist.');
  return data.data;
}

export async function removeFromWatchlist(ticker: string, token: string | null) {
  const response = await fetch(`${API_URL}/api/watchlist/${ticker}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Failed to remove from watchlist.');
  return data;
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message ?? "Chat request failed");
  }
  return data;
}

export { API_URL };