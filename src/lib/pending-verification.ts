const STORAGE_KEY = "chusec.pendingVerificationEmail";

/** Remembers which address the verification link went to across a page change. */
export function setPendingVerificationEmail(email: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, email);
  } catch {
    // Storage unavailable — the email query param is the fallback.
  }
}

export function getPendingVerificationEmail() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function clearPendingVerificationEmail() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // No-op.
  }
}
