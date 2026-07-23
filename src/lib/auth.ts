export interface CurrentUser {
  username: string;
  role: string;
  name: string;
}

export function getCurrentUser(): CurrentUser | null {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

const MANAGEMENT_ROLES = ["admin", "safety", "safety_officer", "hrd"];

export function canManage(): boolean {
  return MANAGEMENT_ROLES.includes(getCurrentUser()?.role ?? "");
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
