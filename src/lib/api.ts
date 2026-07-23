import { authHeaders } from "./auth";

export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export async function fetchJSON(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function assignUserToEmployee(
  employeeId: string,
  userId: number | null,
) {
  return fetchJSON(`/api/employees/${employeeId}/assign-user`, {
    method: "PUT",
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function getAvailableUsers() {
  return fetchJSON("/api/users/available");
}
