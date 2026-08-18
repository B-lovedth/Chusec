export type Coordinates = {
  lat: number;
  lon: number;
};

export type GeoPermission = "granted" | "denied" | "prompt" | "unsupported";

/**
 * Reads the permission state without prompting. Not every browser exposes the
 * Permissions API for geolocation, hence the "unsupported" case — callers
 * should fall back to simply requesting a fix.
 */
export async function getGeolocationPermission(): Promise<GeoPermission> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) return "unsupported";

  try {
    const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    return status.state as GeoPermission;
  } catch {
    return "unsupported";
  }
}

/** Resolves to null rather than throwing when permission is denied or absent. */
export function getCurrentCoordinates(timeoutMs = 8000): Promise<Coordinates | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return Promise.resolve(null);

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
      () => resolve(null),
      { timeout: timeoutMs, maximumAge: 60_000 },
    );
  });
}

/**
 * The API takes both `lat`/`lon` and a required `x`/`y` pair whose coordinate
 * system is undocumented. Longitude/latitude is the assumption until the
 * backend confirms — see the note in the integration summary.
 */
export function toApiPoint(coordinates: Coordinates | null) {
  return {
    x: coordinates?.lon ?? 0,
    y: coordinates?.lat ?? 0,
    lat: coordinates?.lat ?? null,
    lon: coordinates?.lon ?? null,
  };
}
