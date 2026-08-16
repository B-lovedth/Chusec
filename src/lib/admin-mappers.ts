import type { CommandIncident, CommandStat, SecurityUnit, Agency } from "@/data/admin";
import type { DashboardStats, IncidentResponse, UnitResponse } from "@/services/types";
import { toSeverity } from "@/lib/mappers";

/* ------------------------------------------------------------------ *
 * Stats
 * ------------------------------------------------------------------ */

const numberFormat = new Intl.NumberFormat("en-NG");

/**
 * The API exposes nine counters; the design shows five. This is the mapping —
 * worth confirming with the backend that "Live SOS" means active beacons
 * rather than critical alerts.
 */
export function toCommandStats(stats: DashboardStats): CommandStat[] {
  return [
    { key: "active", label: "Active", value: numberFormat.format(stats.active_incidents) },
    { key: "liveSos", label: "Live SOS", value: numberFormat.format(stats.active_beacons) },
    { key: "citizensAlerted", label: "Citizens Alerted", value: numberFormat.format(stats.citizen_reports) },
    { key: "unitDeployed", label: "Unit Deployed", value: numberFormat.format(stats.units_dispatched) },
    { key: "resolvedToday", label: "Resolved Today", value: numberFormat.format(stats.resolved_incidents) },
  ];
}

/* ------------------------------------------------------------------ *
 * Incidents
 * ------------------------------------------------------------------ */

/** Rough bounds of the southern-Nigeria view the command map draws. */
const MAP_BOUNDS = { minLon: 3.2, maxLon: 9.4, minLat: 4.2, maxLat: 7.8 };

function clampPercent(value: number) {
  return Math.max(4, Math.min(96, value));
}

/**
 * The API's `x`/`y` are in an undocumented coordinate space, so lat/lon is
 * preferred when present. Falls back to treating x/y as percentages.
 */
function toMapPoint(incident: IncidentResponse) {
  if (incident.lon !== null && incident.lat !== null) {
    return {
      x: clampPercent(
        ((incident.lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * 100,
      ),
      y: clampPercent(
        ((MAP_BOUNDS.maxLat - incident.lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100,
      ),
    };
  }

  return { x: clampPercent(incident.x), y: clampPercent(incident.y) };
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export function toCommandIncident(incident: IncidentResponse): CommandIncident {
  const severity = toSeverity(incident.severity);

  return {
    id: String(incident.id),
    reference: `INC-${String(incident.id).padStart(3, "0")}`,
    date: formatDate(incident.created_at),
    time: incident.time,
    title: incident.type,
    location: incident.location_name,
    tag: incident.is_sos ? { kind: "sos" } : { kind: "severity", value: severity },
    point: toMapPoint(incident),
    severity,
    reportedBy: incident.is_sos ? "SOS beacon" : "Citizen report",
    narrative: `${incident.type} reported at ${incident.location_name}. ${incident.report_count} report${
      incident.report_count === 1 ? "" : "s"
    } received.`,
    evidence: [],
  };
}

/** Buckets incidents into 24 hourly counts, for the Incidents / Hour chart. */
export function toHourlySeries(incidents: IncidentResponse[]): number[] {
  const buckets = new Array<number>(24).fill(0);

  incidents.forEach((incident) => {
    const hour = Number.parseInt(incident.time?.slice(0, 2) ?? "", 10);
    if (Number.isInteger(hour) && hour >= 0 && hour < 24) buckets[hour] += 1;
  });

  return buckets;
}

/* ------------------------------------------------------------------ *
 * Units
 * ------------------------------------------------------------------ */

const KNOWN_AGENCIES: Agency[] = [
  "Nigeria Police Force",
  "DSS",
  "NSCDC",
  "Immigration",
  "Nigeria Custom",
  "Correctional Service",
  "NDLEA",
  "FRSC",
];

function toAgency(value: string | null): Agency {
  const match = KNOWN_AGENCIES.find(
    (agency) => agency.toLowerCase() === (value ?? "").trim().toLowerCase(),
  );
  return match ?? "Nigeria Police Force";
}

/** `responders` and `vehicles` arrive as delimited strings. */
function toList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(/[,;|\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function toSecurityUnit(unit: UnitResponse): SecurityUnit {
  return {
    id: String(unit.id),
    name: unit.name,
    agency: toAgency(unit.agency),
    state: "Delta State",
    address: unit.address ?? "—",
    lga: unit.lga ?? "",
    phone: unit.phone ?? "—",
    respondingUnit: unit.responding_unit ?? "—",
    teamLead: unit.team_lead ?? "—",
    responders: toList(unit.responders),
    vehicles: toList(unit.vehicles),
  };
}
