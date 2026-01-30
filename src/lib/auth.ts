export type Role = "super_admin" | "school" | "parent";

export type AuthUser = {
  id: number | string;
  username: string;
  role: Role;
  tenant_id?: string | null;
};

export function saveSession(access_token: string, user: AuthUser) {
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getRole(): Role | null {
  return getUser()?.role ?? null;
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem("access_token");
}
