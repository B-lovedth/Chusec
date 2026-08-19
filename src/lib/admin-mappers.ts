import type {
  Agency,
  CommandIncident,
  CommandStat,
  IncidentOutcome,
  SecurityUnit,
} from "@/data/admin";
import type {
  DashboardStats,
  IncidentResponse,
  UnitAssignedIncidentResponse,
  UnitDashboardResponse,
  UnitResponse,
} from "@/services/types";
import { toSeverity } from "@/lib/mappers";
import { UNIT_STATUSES, type UnitStatus } from "@/components/unit/ResponseProgress";

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

/** Normalises the server's progress string onto the stepper's four states. */
export function toUnitStatus(value: string | null | undefined): UnitStatus {
  const normalised = (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const match = UNIT_STATUSES.find((status) => status === normalised);
  if (match) return match;
  // Older records use "routing"; treat anything unknown as freshly dispatched.
  return normalised === "routing" ? "en_route" : "dispatched";
}

export function toAssignedIncident(incident: UnitAssignedIncidentResponse): CommandIncident {
  const severity = toSeverity(incident.severity);

  return {
    id: String(incident.id),
    reference: `INC-${String(incident.id).padStart(3, "0")}`,
    date: formatDate(incident.created_at),
    time: new Date(incident.created_at).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    title: incident.type,
    location: incident.location_name,
    tag: incident.resolved ? { kind: "resolved" } : { kind: "severity", value: severity },
    point: { x: 50, y: 50 },
    coordinates:
      incident.lat !== null && incident.lon !== null
        ? { lat: incident.lat, lon: incident.lon }
        : null,
    severity,
    reportedBy: "Command dispatch",
    narrative: incident.description ?? `${incident.type} at ${incident.location_name}.`,
    description: incident.description?.trim() || null,
    // A unit reading its own queue is the assignee; the payload doesn't repeat it.
    assignedUnit: null,
    unitStatus: toUnitStatus(incident.unit_status),
    unitTimeline: {
      dispatched: formatMoment(incident.created_at),
      enRoute: formatMoment(incident.en_route_at),
      onScene: formatMoment(incident.arrived_at),
      resolved: formatMoment(incident.resolved_at),
    },
    isResolved: Boolean(incident.resolved),
    clearanceNotes: incident.clearance_notes?.trim() || null,
    outcome: toOutcome(incident),
    evidence: [],
  };
}

/** Casualty counters, coerced so a missing field reads as zero, not NaN. */
function toOutcome(incident: IncidentResponse | UnitAssignedIncidentResponse): IncidentOutcome {
  const count = (value: number | null | undefined) =>
    Number.isFinite(Number(value)) ? Number(value) : 0;

  return {
    victimsInjured: count(incident.victims_injured),
    victimsDead: count(incident.victims_dead),
    criminalsInjured: count(incident.criminals_injured),
    criminalsDead: count(incident.criminals_dead),
    criminalsArrested: count(incident.criminals_arrested),
    agentsInjured: count(incident.agents_injured),
    agentsDead: count(incident.agents_dead),
  };
}

/** "Mar 4, 2026, 14:20" — or an em dash when the stage has not happened. */
function formatMoment(iso: string | null | undefined) {
  if (!iso) return "—";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toCommandIncident(incident: IncidentResponse): CommandIncident {
  const severity = toSeverity(incident.severity);
  const assignedId = incident.assigned_unit_id;

  return {
    id: String(incident.id),
    reference: `INC-${String(incident.id).padStart(3, "0")}`,
    date: formatDate(incident.created_at),
    time: incident.time,
    title: incident.type,
    location: incident.location_name,
    tag: incident.is_sos ? { kind: "sos" } : { kind: "severity", value: severity },
    point: toMapPoint(incident),
    coordinates:
      incident.lat !== null && incident.lon !== null
        ? { lat: incident.lat, lon: incident.lon }
        : null,
    severity,
    reportedBy: incident.is_sos ? "SOS beacon" : "Citizen report",
    // The reporter's own account is worth more than a generated sentence, so
    // it wins when present; the summary is the fallback.
    narrative:
      incident.description?.trim() ||
      `${incident.type} reported at ${incident.location_name}. ${incident.report_count} report${
        incident.report_count === 1 ? "" : "s"
      } received.`,
    description: incident.description?.trim() || null,
    assignedUnit:
      assignedId !== null && assignedId !== undefined
        ? {
            id: String(assignedId),
            callsign: incident.assigned_unit_callsign || `Unit ${assignedId}`,
          }
        : null,
    // Only meaningful once someone is actually assigned.
    unitStatus:
      assignedId !== null && assignedId !== undefined ? toUnitStatus(incident.unit_status) : null,
    unitTimeline: {
      dispatched: formatMoment(incident.created_at),
      enRoute: formatMoment(incident.en_route_at),
      onScene: formatMoment(incident.arrived_at),
      resolved: formatMoment(incident.resolved_at),
    },
    isResolved: Boolean(incident.resolved),
    clearanceNotes: incident.clearance_notes?.trim() || null,
    outcome: toOutcome(incident),
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

/** Returns null rather than guessing — badging every unclassified unit as
 *  police would be a fabrication on a law-enforcement screen. */
export function toAgency(value: string | null | undefined): Agency | null {
  const match = KNOWN_AGENCIES.find(
    (agency) => agency.toLowerCase() === (value ?? "").trim().toLowerCase(),
  );
  return match ?? null;
}

/** `responders` and `vehicles` arrive as delimited strings. */
function toList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(/[,;|\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * The unit portal cannot read `/api/dashboard/units` — that roster is
 * admin-only and answers 403 to a unit token. All a responding unit can plot
 * is itself, from its own dashboard payload.
 */
export function toOwnUnitMarker(dashboard: UnitDashboardResponse): SecurityUnit | null {
  if (dashboard.lat === null || dashboard.lon === null) return null;

  return {
    id: String(dashboard.unit_id),
    name: dashboard.unit_name,
    agency: toAgency(dashboard.agency),
    callsign: dashboard.callsign ?? null,
    lat: dashboard.lat,
    lon: dashboard.lon,
    isActive: true,
    state: "—",
    address: "—",
    lga: "",
    phone: "—",
    respondingUnit: "—",
    teamLead: "—",
    responders: [],
    vehicles: [],
  };
}

export function toSecurityUnit(unit: UnitResponse): SecurityUnit {
  return {
    id: String(unit.id),
    name: unit.name,
    agency: toAgency(unit.agency),
    callsign: unit.callsign ?? null,
    lat: unit.lat ?? null,
    lon: unit.lon ?? null,
    isActive: unit.is_active,
    state: unit.state ?? "—",
    address: unit.address ?? "—",
    lga: unit.lga ?? "",
    phone: unit.phone ?? "—",
    respondingUnit: unit.responding_unit ?? "—",
    teamLead: unit.team_lead ?? "—",
    responders: toList(unit.responders),
    vehicles: toList(unit.vehicles),
  };
}
