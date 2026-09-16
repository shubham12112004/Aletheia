import { API_URL, authHeaders } from './api';

async function handleResponse(response: Response, defaultErrorMsg: string) {
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message ?? defaultErrorMsg);
  }
  return data.data;
}

export async function getSettings(token: string | null) {
  const response = await fetch(`${API_URL}/api/settings`, {
    method: 'GET',
    headers: authHeaders(token),
  });
  return handleResponse(response, 'Failed to fetch settings');
}

export async function updateProfile(payload: unknown, token: string | null) {
  const response = await fetch(`${API_URL}/api/settings/profile`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, 'Failed to update profile');
}

export async function updatePassword(payload: unknown, token: string | null) {
  const response = await fetch(`${API_URL}/api/settings/password`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, 'Failed to update password');
}

export async function updateWorkspace(payload: unknown, token: string | null) {
  const response = await fetch(`${API_URL}/api/settings/workspace`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, 'Failed to update workspace settings');
}

export async function updatePreferences(payload: unknown, token: string | null) {
  const response = await fetch(`${API_URL}/api/settings/preferences`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, 'Failed to update preferences');
}

export async function updateNotifications(payload: unknown, token: string | null) {
  const response = await fetch(`${API_URL}/api/settings/notifications`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, 'Failed to update notifications');
}

export async function updateTheme(payload: unknown, token: string | null) {
  const response = await fetch(`${API_URL}/api/settings/theme`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, 'Failed to update theme');
}

export async function updateSecurity(payload: unknown, token: string | null) {
  const response = await fetch(`${API_URL}/api/settings/security`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, 'Failed to update security settings');
}

export async function updateApiKeys(payload: unknown, token: string | null) {
  const response = await fetch(`${API_URL}/api/settings/apis`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, 'Failed to update API keys');
}

export async function updateRuntime(payload: unknown, token: string | null) {
  const response = await fetch(`${API_URL}/api/settings/runtime`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, 'Failed to update runtime options');
}

export async function updateAnalysis(payload: unknown, token: string | null) {
  const response = await fetch(`${API_URL}/api/settings/analysis`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, 'Failed to update analysis settings');
}

export async function deleteAccount(token: string | null) {
  const response = await fetch(`${API_URL}/api/settings/account`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return handleResponse(response, 'Failed to delete account');
}
