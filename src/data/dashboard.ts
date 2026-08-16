export type Severity = "Critical" | "High" | "Medium" | "Low";

export type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  emergencyContact: string;
  nin: string;
  location: string;
  avatar: string;
};

export type IncidentItem = {
  id: number;
  title: string;
  distance: string;
  time: string;
  severity: Severity;
};

export type TransitCorridor = {
  id: number;
  /** Pre-formatted for display, e.g. `Warri → Asaba (A232)`. */
  name: string;
  description: string;
  distance: string;
  severity: Severity;
};

export type ActiveCorridor = {
  status: string;
  message: string;
};

export const currentUser: UserProfile = {
  firstName: "Jack",
  lastName: "Doe",
  email: "jack.doe@gmail.com",
  phoneNumber: "+2348181804434",
  emergencyContact: "+2348181804434",
  nin: "12345678901",
  location: "Warri",
  avatar: "/avatar-placeholder.svg",
};

export const activeCorridor: ActiveCorridor = {
  status: "ACTIVE",
  message: "Warri-Sapele Rd & Benin-Auchi corridor. Avoid travel.",
};

export const nearbyIncidents: IncidentItem[] = [
  { id: 1, title: "Armed Robbery", distance: "1.2 km NE", time: "14:32", severity: "Critical" },
  { id: 2, title: "Cult Activity", distance: "3.5 km SW", time: "09:20", severity: "High" },
  { id: 3, title: "Fake Checkpoint", distance: "5.1 km N", time: "13:18", severity: "High" },
];

export const transitCorridors: TransitCorridor[] = [
  {
    id: 1,
    name: "Warri → Asaba",
    description: "High-Alert Polygon · 3 incidents today",
    distance: "142 km",
    severity: "Critical",
  },
  {
    id: 2,
    name: "Benin → Auchi",
    description: "High-Alert Polygon · 2 incidents today",
    distance: "111 km",
    severity: "High",
  },
  {
    id: 3,
    name: "Asaba → Agbor",
    description: "Fake checkpoint unconfirmed",
    distance: "47 km",
    severity: "Medium",
  },
  {
    id: 4,
    name: "Benin → Sapele",
    description: "Clear",
    distance: "72 km",
    severity: "Low",
  },
];
