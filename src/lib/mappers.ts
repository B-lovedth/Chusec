import { currentUser, type IncidentItem, type Severity, type TransitCorridor, type UserProfile } from "@/data/dashboard";
import type { IncidentResponse, RouteResponse, UserResponse } from "@/services/types";

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

export function toIncidentItem(incident: IncidentResponse): IncidentItem {
  return {
    id: incident.id,
    title: incident.type,
    distance: incident.location_name,
    time: incident.time,
    severity: toSeverity(incident.severity),
  };
}

export function toTransitCorridor(route: RouteResponse): TransitCorridor {
  return {
    id: route.id,
    name: formatCorridorName(route.name),
    description: `${route.risk_pct}% risk · ${route.incident_count} ${
      route.incident_count === 1 ? "incident" : "incidents"
    } today`,
    distance: route.distance_km,
    severity: toSeverity(route.risk_level),
  };
}

/** Splits the API's single display name back into the two form fields. */
export function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
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
    // The API has no home location field — keep the fixture value for the chip.
    location: currentUser.location,
    avatar: user.avatar_url || currentUser.avatar,
  };
}
