import { listIncidents, listIncidentHistory } from "@/services/incidents.service";
import { listRoutes } from "@/services/routes.service";
import { getFieldUnits } from "@/services/dashboard.service";
import { toIncidentItem, toTransitCorridor } from "@/lib/mappers";
import { toCommandIncident, toSecurityUnit } from "@/lib/admin-mappers";
import type { IncidentItem, TransitCorridor } from "@/data/dashboard";
import type { CommandIncident, SecurityUnit } from "@/data/admin";
import type { AlertTone, SafetyAlert } from "@/data/alerts";

function toAlertTone(severity: string | null | undefined): AlertTone {
  switch ((severity ?? "").trim().toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "medium":
      return "medium";
    default:
      return "info";
  }
}

/**
 * Module-level so `useApiList` effects keep a stable dependency.
 */
export async function loadNearbyIncidents(): Promise<IncidentItem[]> {
  const incidents = await listIncidents();
  return incidents.map(toIncidentItem);
}

export async function loadTransitCorridors(): Promise<TransitCorridor[]> {
  const routes = await listRoutes();
  return routes.map(toTransitCorridor);
}

/* ------------------------------------------------------------------ *
 * Command centre
 * ------------------------------------------------------------------ */

export async function loadCommandIncidents(): Promise<CommandIncident[]> {
  const incidents = await listIncidents();
  return incidents.map(toCommandIncident);
}

export async function loadIncidentHistory(): Promise<CommandIncident[]> {
  const incidents = await listIncidentHistory();
  return incidents.map(toCommandIncident);
}

export async function loadSecurityUnits(): Promise<SecurityUnit[]> {
  const units = await getFieldUnits();
  return units.map(toSecurityUnit);
}

/**
 * There is no alerts endpoint, so the citizen Alerts screen is derived from
 * the incident feed. Swap this for the real endpoint when one exists.
 */
export async function loadSafetyAlerts(): Promise<SafetyAlert[]> {
  const incidents = await listIncidents();

  return incidents.map((incident) => ({
    id: incident.id,
    location: incident.location_name,
    message: `${incident.severity?.toUpperCase() ?? "ALERT"}: ${incident.type} — ${incident.location_name}`,
    time: incident.time,
    tone: toAlertTone(incident.severity),
    read: incident.successful,
  }));
}
