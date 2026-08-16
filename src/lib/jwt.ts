export type JwtPayload = Record<string, unknown>;

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    segment.length + ((4 - (segment.length % 4)) % 4),
    "=",
  );

  // atob yields Latin-1; round-trip through percent-encoding for UTF-8 claims.
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Reads a JWT's claims. Returns null for anything that is not a readable JWT. */
export function decodeJwtPayload(token: string): JwtPayload | null {
  const segments = token.split(".");
  if (segments.length < 2) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(segments[1]));
    return typeof payload === "object" && payload !== null ? (payload as JwtPayload) : null;
  } catch {
    return null;
  }
}

const ROLE_CLAIMS = ["role", "user_role", "userRole", "roles", "scope", "type"];

/**
 * Pulls a role hint out of the token. Claim naming is not standardised, so
 * this is only a hint — `GET /api/auth/verify` remains the authority.
 */
export function roleFromToken(token: string): string {
  const payload = decodeJwtPayload(token);
  if (!payload) return "";

  for (const claim of ROLE_CLAIMS) {
    const value = payload[claim];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }

  return "";
}

/** Seconds-precision `exp` claim, or null when the token carries none. */
export function tokenExpiry(token: string): number | null {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  return typeof exp === "number" ? exp : null;
}

export function isTokenExpired(token: string, skewSeconds = 30): boolean {
  const exp = tokenExpiry(token);
  if (exp === null) return false;
  return exp * 1000 <= Date.now() + skewSeconds * 1000;
}
