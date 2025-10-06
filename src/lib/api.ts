export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export async function fetchJSON(path: string) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
