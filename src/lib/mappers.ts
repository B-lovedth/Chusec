import { profileDefaults, type IncidentItem, type Severity, type TransitCorridor, type UserProfile } from "@/data/dashboard";
import type {
  CorridorWaypoint,
  NearbyIncidentResponse,
  TransitCorridorResponse,
  UserResponse,
} from "@/services/types";
import { API_BASE_URL } from "@/services/api";

const SEVERITIES: Severity[] = ["Critical", "High", "Medium", "Low"];

/** The API returns grades uppercase (`HIGH`, `MEDIUM`, `LOW`, `CRITICAL`). */
export function toSeverity(value: string | null | undefined): Severity {
  const normalised = (value ?? "").trim().toLowerCase();
  return SEVERITIES.find((severity) => severity.toLowerCase() === normalised) ?? "Medium";
}

/** `Warri-Asaba (A232)` reads as `Warri → Asaba (A232)`, matching the design. */
export function formatCorridorName(name: string): string {
  return name.replace(/^(\S+)-(\S+)/, "$1 → $2");
}

/**
 * The consolidated dashboard pre-formats distance and bearing, so this needs
 * no arithmetic — it just assembles the "1.2 km NE · 14:32" line.
 */
export function toNearbyIncidentItem(incident: NearbyIncidentResponse): IncidentItem {
  const distance = [incident.distance_formatted, incident.cardinal_direction]
    .filter(Boolean)
    .join(" ");

  return {
    id: incident.id,
    title: incident.type,
    distance: distance || incident.location_name,
    time: incident.time_formatted,
    severity: toSeverity(incident.severity),
  };
}

export function toDashboardCorridor(corridor: TransitCorridorResponse): TransitCorridor {
  return {
    id: corridor.id,
    name: formatCorridorName(corridor.name),
    description: `${corridor.risk_pct}% risk · ${corridor.incident_count} incidents today`,
    distance: corridor.distance_km,
    severity: toSeverity(corridor.severity || corridor.risk_level),
  };
}

export type CorridorLine = {
  id: string;
  /** `[lon, lat]` pairs, GeoJSON order. */
  coordinates: [number, number][];
  color: string;
  name: string;
};

/** Coordinates have arrived as numeric strings before — coerce, then verify. */
function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Waypoints arrive either as named objects or as bare pairs. A bare pair is
 * `[lon, lat]` — GeoJSON order, confirmed with the backend. The order cannot
 * be inferred from the values themselves, because Delta State's latitude and
 * longitude ranges overlap, so this stays an agreement rather than a check.
 */
function toLngLat(point: CorridorWaypoint): [number, number] | null {
  if (Array.isArray(point)) {
    const lon = toNumber(point[0]);
    const lat = toNumber(point[1]);
    return lon !== null && lat !== null ? [lon, lat] : null;
  }

  const lat = toNumber(point.lat ?? point.latitude);
  const lon = toNumber(point.lon ?? point.lng ?? point.longitude);
  return lat !== null && lon !== null ? [lon, lat] : null;
}

/**
 * Builds the polyline for a corridor. Returns null when the backend has not
 * populated geometry yet, so nothing is drawn rather than a wrong line.
 */
export function toCorridorLine(corridor: TransitCorridorResponse): CorridorLine | null {
  const coordinates: [number, number][] = [];

  const startLat = toNumber(corridor.start_lat);
  const startLon = toNumber(corridor.start_lon);
  if (startLat !== null && startLon !== null) coordinates.push([startLon, startLat]);

  (corridor.waypoints ?? []).forEach((point) => {
    const pair = toLngLat(point);
    if (pair) coordinates.push(pair);
  });

  const endLat = toNumber(corridor.end_lat);
  const endLon = toNumber(corridor.end_lon);
  if (endLat !== null && endLon !== null) coordinates.push([endLon, endLat]);

  // A line needs two distinct ends.
  if (coordinates.length < 2) return null;

  return {
    id: String(corridor.id),
    coordinates,
    color: toLineColor(corridor.color, corridor.severity || corridor.risk_level),
    name: formatCorridorName(corridor.name),
  };
}

/**
 * `color` is fed straight into a Mapbox paint property, and Mapbox rejects the
 * whole layer if any feature carries a value it cannot parse — one bad string
 * would take every corridor off the map, not just its own. Anything that is
 * not plainly a CSS colour falls back to the severity grade.
 */
function toLineColor(color: string | null | undefined, grade: string | null | undefined) {
  const candidate = (color ?? "").trim();
  const isCssColor =
    /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(candidate) ||
    /^(?:rgb|hsl)a?\([^)]*\)$/i.test(candidate);

  return isCssColor ? candidate : SEVERITY_COLOR[toSeverity(grade)];
}

export const SEVERITY_COLOR: Record<Severity, string> = {
  Critical: "#ef4136",
  High: "#f7861b",
  Medium: "#f5b70a",
  Low: "#16b364",
};

/** Splits the API's single display name back into the two form fields. */
export function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

/**
 * Uploaded avatars may come back as a path relative to the API host. Left as
 * given, the browser would resolve it against the frontend origin and 404.
 */
export function toAvatarUrl(avatarUrl: string | null): string {
  if (!avatarUrl) return profileDefaults.avatar;
  if (/^(https?:|data:|blob:)/.test(avatarUrl)) return avatarUrl;
  return `${API_BASE_URL}${avatarUrl.startsWith("/") ? "" : "/"}${avatarUrl}`;
}

export function toUserProfile(user: UserResponse): UserProfile {
  const { firstName, lastName } = splitName(user.name);

  return {
    firstName,
    lastName,
    email: user.email ?? "",
    phoneNumber: user.phone ?? "",
    emergencyContact: user.emergency_contact ?? "",
    nin: user.nin ?? "",
    // Resolved per-request by the citizen dashboard, not stored on the user.
    location: "",
    avatar: toAvatarUrl(user.avatar_url),
    isProfileComplete: user.is_profile_complete ?? true,
  };
}
