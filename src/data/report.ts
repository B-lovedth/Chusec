export const incidentTypes = [
  "Armed Robbery",
  "Fake Checkpoint",
  "Kidnapping",
  "Cult Activity",
  "Suspicious Activity",
  "Vehicle Snatching",
] as const;

export type IncidentType = (typeof incidentTypes)[number];

