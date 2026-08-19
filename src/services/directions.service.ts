import { MAPBOX_TOKEN } from "@/components/map/MapboxMap";

export type LngLat = [number, number];

export type DrivingRoute = {
  /** Road-following `[lon, lat]` pairs, GeoJSON order. */
  coordinates: LngLat[];
  distanceKm: number;
  durationMinutes: number;
};

/**
 * Road geometry from the Mapbox Directions API.
 *
 * Every route is cached, because these are billed per request and the same
 * pairs are asked for constantly — a corridor's shape never changes, and a
 * dispatch route only changes when the unit moves. Coordinates are rounded to
 * ~11 m before they become a cache key so that GPS jitter doesn't defeat it.
 */
const memoryCache = new Map<string, DrivingRoute | null>();

/** Survives navigation within the tab; corridors then cost one request each. */
const STORAGE_PREFIX = "chusec.route.";

function round(value: number) {
  return Math.round(value * 10_000) / 10_000;
}

function cacheKey(points: LngLat[]) {
  return points.map(([lon, lat]) => `${round(lon)},${round(lat)}`).join(";");
}

function readStored(key: string): DrivingRoute | null | undefined {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as DrivingRoute) : undefined;
  } catch {
    return undefined;
  }
}

function writeStored(key: string, route: DrivingRoute) {
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(route));
  } catch {
    // Quota or private mode — the in-memory cache still does its job.
  }
}

/**
 * Traces a driving route through the given points, in order.
 *
 * Resolves to `null` rather than throwing when there is no token, fewer than
 * two points, or no road route between them — callers fall back to a straight
 * line, which is worse but never blank.
 */
export async function getDrivingRoute(points: LngLat[]): Promise<DrivingRoute | null> {
  if (!MAPBOX_TOKEN || points.length < 2) return null;

  // The API takes at most 25 coordinates per request.
  const trimmed = points.length <= 25 ? points : thinTo(points, 25);
  const key = cacheKey(trimmed);

  const cached = memoryCache.get(key);
  if (cached !== undefined) return cached;

  const stored = readStored(key);
  if (stored !== undefined) {
    memoryCache.set(key, stored);
    return stored;
  }

  const path = trimmed.map(([lon, lat]) => `${lon},${lat}`).join(";");
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${path}` +
    `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      memoryCache.set(key, null);
      return null;
    }

    const payload = (await response.json()) as {
      code?: string;
      routes?: { distance: number; duration: number; geometry: { coordinates: LngLat[] } }[];
    };

    const route = payload.routes?.[0];
    if (payload.code !== "Ok" || !route?.geometry?.coordinates?.length) {
      // Cached as a miss so a road-less pair isn't retried on every render.
      memoryCache.set(key, null);
      return null;
    }

    const result: DrivingRoute = {
      coordinates: route.geometry.coordinates,
      distanceKm: route.distance / 1000,
      durationMinutes: route.duration / 60,
    };

    memoryCache.set(key, result);
    writeStored(key, result);
    return result;
  } catch {
    memoryCache.set(key, null);
    return null;
  }
}

/** Keeps the ends and samples evenly between them. */
function thinTo(points: LngLat[], limit: number): LngLat[] {
  const step = (points.length - 1) / (limit - 1);
  return Array.from({ length: limit }, (_, index) => points[Math.round(index * step)]);
}
