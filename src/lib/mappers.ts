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

/**
 * Waypoints arrive either as named objects or as bare pairs. Named keys are
 * unambiguous; a bare pair is assumed to be `[lon, lat]` (GeoJSON order),
 * which cannot be inferred from the values themselves because Delta State's
 * latitude and longitude ranges overlap.
 */
function toLngLat(point: CorridorWaypoint): [number, number] | null {
  if (Array.isArray(point)) {
    const [a, b] = point;
    return Number.isFinite(a) && Number.isFinite(b) ? [a, b] : null;
  }

  const lat = point.lat ?? point.latitude;
  const lon = point.lon ?? point.lng ?? point.longitude;
  return Number.isFinite(lat) && Number.isFinite(lon) ? [lon as number, lat as number] : null;
}

/**
 * Builds the polyline for a corridor. Returns null when the backend has not
 * populated geometry yet, so nothing is drawn rather than a wrong line.
 */
export function toCorridorLine(corridor: TransitCorridorResponse): CorridorLine | null {
  const coordinates: [number, number][] = [];

  if (Number.isFinite(corridor.start_lat) && Number.isFinite(corridor.start_lon)) {
    coordinates.push([corridor.start_lon as number, corridor.start_lat as number]);
  }

  (corridor.waypoints ?? []).forEach((point) => {
    const pair = toLngLat(point);
    if (pair) coordinates.push(pair);
  });

  if (Number.isFinite(corridor.end_lat) && Number.isFinite(corridor.end_lon)) {
    coordinates.push([corridor.end_lon as number, corridor.end_lat as number]);
  }

  // A line needs two distinct ends.
  if (coordinates.length < 2) return null;

  return {
    id: String(corridor.id),
    coordinates,
    color: corridor.color || SEVERITY_COLOR[toSeverity(corridor.severity || corridor.risk_level)],
    name: formatCorridorName(corridor.name),
  };
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
  };
}
