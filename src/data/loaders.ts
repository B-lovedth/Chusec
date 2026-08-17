import {
  listAssignedIncidents,
  listIncidents,
  listIncidentHistory,
} from "@/services/incidents.service";
import { getFieldUnits, listMembers } from "@/services/dashboard.service";
import { toCommandIncident, toSecurityUnit } from "@/lib/admin-mappers";
import type { CommandIncident, Member, SecurityUnit } from "@/data/admin";
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

/** Incidents assigned to the signed-in responding unit. */
export async function loadAssignedIncidents(): Promise<CommandIncident[]> {
  const incidents = await listAssignedIncidents();
  return incidents.map(toCommandIncident);
}

export async function loadMembers(): Promise<Member[]> {
  const members = await listMembers();

  return members.map((member) => ({
    id: String(member.id),
    name: member.name,
    role: member.role,
    email: member.email,
    // The API models activation, not invite state; unverified reads as pending.
    status: member.is_verified ? "Active" : "Pending",
  }));
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
