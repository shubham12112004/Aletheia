/**
 * @file api.ts
 * @description Core API abstraction layer for the Aletheia frontend. Handles all outbound HTTP requests
 * to the Aletheia backend service, including authentication, research generation, and watchlist management.
 */

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

/**
 * Helper to construct authentication headers.
 * @param {string | null} token - The JWT token for the session.
 * @returns {Record<string, string>} A dictionary of HTTP headers.
 */
export function authHeaders(token: string | null) {
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
}

/**
 * Dispatches a new research task to the backend AI agent swarm.
 * @param {unknown} payload - The research request payload (e.g., { ticker: 'AAPL', parameters: {} }).
 * @returns {Promise<any>} The completed research snapshot or an error if the pipeline fails.
 */
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

/**
 * Authenticates a user via Google OAuth identity tokens.
 * @param {string} idToken - The Google-provided ID token.
 * @param {string} turnstileToken - The Cloudflare Turnstile CAPTCHA token.
 * @returns {Promise<{ token: string; user: { email: string; name?: string } }>} The authenticated session details.
 */
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

/**
 * Registers a new user using email and password.
 * @param {unknown} payload - The signup payload (name, email, password, turnstileToken).
 * @returns {Promise<{ token: string; user: { email: string; name: string } }>} The authenticated session details.
 */
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

/**
 * Authenticates an existing user via email and password.
 * @param {unknown} payload - The login payload (email, password, turnstileToken).
 * @returns {Promise<{ token: string; user: { email: string; name: string } }>} The authenticated session details.
 */
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

/**
 * Initiates the password recovery process by generating and sending an OTP to the user's email.
 * @param {unknown} payload - The forgot password payload (email, turnstileToken).
 * @returns {Promise<any>} The server response confirming the OTP dispatch.
 */
export async function postForgotPassword(payload: unknown) {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Password reset failed.');
  return data;
}

/**
 * Verifies the OTP and sets a new password.
 * @param {{ email: string; otp: string; newPassword: string }} payload - The OTP verification payload.
 * @returns {Promise<any>} The server response confirming the password change.
 */
export async function postVerifyOTP(payload: { email: string; otp: string; newPassword: string }) {
  const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'OTP verification failed.');
  return data;
}

/**
 * Updates the user's profile details.
 * @param {unknown} payload - The updated profile object.
 * @param {string | null} token - The JWT token for authorization.
 * @returns {Promise<{ user: { email: string; name: string } }>} The updated user profile.
 */
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

/**
 * Updates the user's password if they are already logged in.
 * @param {unknown} payload - The payload containing current and new password.
 * @param {string | null} token - The JWT token for authorization.
 * @returns {Promise<any>} The server response confirming the password change.
 */
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

/**
 * Permanently deletes the user's account and associated data.
 * @param {string | null} token - The JWT token for authorization.
 * @returns {Promise<any>} The server response confirming deletion.
 */
export async function deleteAccount(token: string | null) {
  const response = await fetch(`${API_URL}/api/auth/delete-account`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Account deletion failed.');
  return data;
}

/**
 * Retrieves the user's personalized stock watchlist.
 * @param {string | null} token - The JWT token for authorization.
 * @returns {Promise<Array<{ ticker: string; name: string }>>} The array of watchlist items.
 */
export async function getWatchlist(token: string | null) {
  const response = await fetch(`${API_URL}/api/watchlist`, {
    method: 'GET',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Failed to fetch watchlist.');
  return data.data as Array<{ ticker: string; name: string }>;
}

/**
 * Adds a new ticker to the user's watchlist.
 * @param {{ ticker: string; name: string }} payload - The asset to track.
 * @param {string | null} token - The JWT token for authorization.
 * @returns {Promise<any>} The updated watchlist data.
 */
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

/**
 * Removes a ticker from the user's watchlist.
 * @param {string} ticker - The ticker symbol to remove.
 * @param {string | null} token - The JWT token for authorization.
 * @returns {Promise<any>} Confirmation of removal.
 */
export async function removeFromWatchlist(ticker: string, token: string | null) {
  const response = await fetch(`${API_URL}/api/watchlist/${ticker}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Failed to remove from watchlist.');
  return data;
}

/**
 * Validates a Cloudflare Turnstile token directly (mostly for backend-to-backend parity checks).
 * @param {string} turnstileToken - The Turnstile CAPTCHA token.
 * @returns {Promise<void>} Resolves if verification succeeds, throws otherwise.
 */
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

/**
 * Dispatches a conversational query to the AI agent during the Interrogation phase.
 * @param {unknown} payload - The chat context and query payload.
 * @returns {Promise<any>} The AI's conversational response.
 */
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

/**
 * Retrieves market overview data (e.g. SPY, QQQ, DIA indices).
 * @param {string | null} token - The JWT token.
 * @returns {Promise<any>}
 */
export async function getMarketOverview(token: string | null) {
  const response = await fetch(`${API_URL}/api/markets/overview`, {
    method: 'GET',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Failed to fetch market overview.');
  return data.data;
}

/**
 * Retrieves stock screener data.
 * @param {string | null} token - The JWT token.
 * @returns {Promise<any>}
 */
export async function getScreenerData(token: string | null) {
  const response = await fetch(`${API_URL}/api/markets/screener`, {
    method: 'GET',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Failed to fetch screener data.');
  return data.data;
}

/**
 * Retrieves the user's simulated portfolio based on their watchlist.
 * @param {string | null} token - The JWT token.
 * @returns {Promise<any>}
 */
export async function getPortfolio(token: string | null) {
  const response = await fetch(`${API_URL}/api/markets/portfolio`, {
    method: 'GET',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message ?? 'Failed to fetch portfolio.');
  return data.data;
}

export { API_URL };