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