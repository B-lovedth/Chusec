/**
 * A clock that agrees with the API, and a parser for the timestamps it sends.
 *
 * Every elapsed-time display in the app is `serverNow() - parseApiDate(stamp)`,
 * so both halves have to sit in the same frame of reference. Device clocks
 * drift and are sometimes plainly wrong, which would otherwise show up as a
 * backup request that has been waiting "-04:12".
 */

/** Milliseconds to add to `Date.now()` to land on the server's clock. */
let skewMs = 0;
let hasSynced = false;

/**
 * Called on every API response. The `Date` header is the server's own view of
 * now, and is authoritative for anything we compare its timestamps against.
 */
export function syncServerClock(headerDate: string | null) {
  if (!headerDate) return;

  const serverMs = Date.parse(headerDate);
  if (Number.isNaN(serverMs)) return;

  // The header has one-second resolution and the response spent time in
  // flight, so this is accurate to about a second — far below the threshold
  // that matters for a MM:SS readout.
  skewMs = serverMs - Date.now();
  hasSynced = true;
}

export function serverNow(): number {
  return Date.now() + skewMs;
}

/** False until the first API response has landed. */
export function isClockSynced() {
  return hasSynced;
}

/**
 * The API sends naive timestamps — "2026-08-19T00:37:05.993510", with no `Z`
 * and no offset. The browser reads those as *local* time, which in Lagos puts
 * every duration out by an hour. They are treated as UTC here, matching
 * Python's `datetime.utcnow()`, which is what the backend appears to use.
 *
 * Confirm this with the backend: if they ever start sending an offset, the
 * check below already respects it and nothing needs to change.
 */
export function parseApiDate(value: string | null | undefined): number | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // Already carries a zone — trust it as-is.
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  const parsed = Date.parse(hasZone ? trimmed : `${trimmed}Z`);

  return Number.isNaN(parsed) ? null : parsed;
}

/** Seconds between two instants, floored at zero. */
export function secondsBetween(fromMs: number | null, toMs: number | null): number | null {
  if (fromMs === null || toMs === null) return null;
  return Math.max(0, Math.round((toMs - fromMs) / 1000));
}

/** Seconds as MM:SS, or H:MM:SS once it runs past an hour. */
export function formatDuration(totalSeconds: number | null): string {
  if (totalSeconds === null) return "--:--";

  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (value: number) => String(value).padStart(2, "0");

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${pad(minutes)}:${pad(secs)}`;
}
