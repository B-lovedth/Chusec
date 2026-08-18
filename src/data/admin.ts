import type { Severity } from "@/data/dashboard";

/* ------------------------------------------------------------------ *
 * Command centre statistics
 * ------------------------------------------------------------------ */

export type StatKey = "active" | "liveSos" | "citizensAlerted" | "unitDeployed" | "resolvedToday";

export type CommandStat = {
  key: StatKey;
  label: string;
  value: string;
};

export type QueueTag = { kind: "severity"; value: Severity } | { kind: "sos" } | { kind: "resolved" };

export type CommandIncident = {
  id: string;
  reference: string;
  date: string;
  time: string;
  title: string;
  location: string;
  tag: QueueTag;
  /** Position on the fallback SVG map, in a 0–100 coordinate space. */
  point: { x: number; y: number };
  /** Real coordinates, when the API supplied them — used by Mapbox. */
  coordinates: { lat: number; lon: number } | null;
  severity: Severity;
  reportedBy: string;
  narrative: string;
  evidence: { name: string; kind: string }[];
};

/* ------------------------------------------------------------------ *
 * Nearest forces
 * ------------------------------------------------------------------ */

export type Agency =
  | "Nigeria Police Force"
  | "DSS"
  | "NSCDC"
  | "Immigration"
  | "Nigeria Custom"
  | "Correctional Service"
  | "NDLEA"
  | "FRSC";

/* ------------------------------------------------------------------ *
 * Members — backed by /api/dashboard/members
 * ------------------------------------------------------------------ */

export type MemberStatus = "Active" | "Pending";

export type Member = {
  id: string;
  name: string;
  /** Free-form on the API — "operator", "admin", "Staff user" and so on. */
  role: string;
  email: string;
  status: MemberStatus;
};

export type SecurityUnit = {
  id: string;
  name: string;
  /** Null when the API has not classified the unit — do not invent one. */
  agency: Agency | null;
  callsign: string | null;
  lat: number | null;
  lon: number | null;
  isActive: boolean;
  state: string;
  address: string;
  lga: string;
  phone: string;
  respondingUnit: string;
  teamLead: string;
  responders: string[];
  vehicles: string[];
};

