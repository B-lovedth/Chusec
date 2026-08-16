const TOKEN_KEY = "chusec.accessToken";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getAccessToken(): string {
  if (typeof window === "undefined") return "";

  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setAccessToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage unavailable — the session lasts until reload.
  }
  emit();
}

export function clearAccessToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // No-op.
  }
  emit();
}

export function isAuthenticated() {
  return getAccessToken().length > 0;
}

/** Lets `useSyncExternalStore` consumers react to sign-in and sign-out. */
export function subscribeToSession(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}
