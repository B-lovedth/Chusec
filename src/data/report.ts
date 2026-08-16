import type { Severity } from "@/data/dashboard";

export const incidentTypes = [
  "Armed Robbery",
  "Fake Checkpoint",
  "Kidnapping",
  "Cult Activity",
  "Suspicious Activity",
  "Vehicle Snatching",
] as const;

export type IncidentType = (typeof incidentTypes)[number];

/** Severity picker exists on the mobile design; the API has no field for it
 *  yet, so the choice is carried in the report note. */
export const severityLevels: Severity[] = ["Critical", "High", "Medium", "Low"];
