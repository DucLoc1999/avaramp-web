export const SESSION_STORAGE_KEY = "ava_ramp_session";

export interface SessionPayload {
  token: string;
  createdAt: number;
  expiresAt?: number;
  mode: "bypass" | "google";
  user?: {
    id: number;
    email: string;
    name: string;
    kyc_status: string;
  };
}

export const hasSession = (): boolean => {
  return isSessionValid();
};

export const getSession = (): SessionPayload | null => {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
};

export const isSessionValid = (): boolean => {
  const session = getSession();
  if (!session?.token) return false;
  if (session.expiresAt && Date.now() >= session.expiresAt) {
    clearSession();
    return false;
  }
  return true;
};

export const createSession = (payload: SessionPayload): void => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
};

export const createBypassSession = (): SessionPayload => {
  const payload: SessionPayload = {
    token: "dev-bypass-token",
    createdAt: Date.now(),
    mode: "bypass",
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  return payload;
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const handleUnauthorized = (): void => {
  clearSession();
  const currentPath = window.location.pathname;
  const nextPath = currentPath === "/ramp" ? "%2Framp" : "%2Flogin";
  window.history.replaceState({}, "", `/login?next=${nextPath}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
};
