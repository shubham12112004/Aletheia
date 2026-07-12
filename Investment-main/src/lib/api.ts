const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export async function postResearch(payload: unknown) {
  const response = await fetch(`${API_URL}/api/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Research request failed' }));
    throw new Error(error.error ?? 'Research request failed');
  }

  return response.json();
}

export async function replayResearch(id: string, socketId?: string) {
  const response = await fetch(`${API_URL}/api/research/${id}/replay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ socketId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Replay request failed' }));
    throw new Error(error.error ?? 'Replay request failed');
  }

  return response.json();
}

export { API_URL };
