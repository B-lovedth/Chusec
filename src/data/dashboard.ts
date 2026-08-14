export type Severity = "Critical" | "High" | "Medium" | "Low";

export type UserProfile = {
  name: string;
  firstName: string;
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
  from: string;
  to: string;
  description: string;
  distance: string;
  severity: Severity;
};

export type ActiveCorridor = {
  status: string;
  message: string;
  severity: Severity;
};

export const currentUser: UserProfile = {
  name: "Jack",
  firstName: "Jack",
  location: "Warri",
  avatar: "/avatar-placeholder.png",
};

export const activeCorridor: ActiveCorridor = {
  status: "ACTIVE",
  message: "Warri-Sapele Rd & Benin-Auchi corridor. Avoid travel.",
  severity: "Critical",
};

export const nearbyIncidents: IncidentItem[] = [
  {
    id: 1,
    title: "Armed Robbery",
    distance: "1.2 km NE",
    time: "14:32",
    severity: "Critical",
  },
  {
    id: 2,
    title: "Cult Activity",
    distance: "3.5 km SW",
    time: "09:20",
    severity: "High",
  },
  {
    id: 3,
    title: "Fake Checkpoint",
    distance: "5.1 km N",
    time: "13:18",
    severity: "High",
  },
];

export const transitCorridors: TransitCorridor[] = [
  {
    id: 1,
    from: "Warri",
    to: "Asaba",
    description: "High-Alert Polygon",
    distance: "142 km",
    severity: "Critical",
  },
  {
    id: 2,
    from: "Benin",
    to: "Auchi",
    description: "High-Alert Polygon",
    distance: "111 km",
    severity: "High",
  },
  {
    id: 3,
    from: "Asaba",
    to: "Agbor",
    description: "Fake checkpoint unconfirmed",
    distance: "47 km",
    severity: "Medium",
  },
  {
    id: 4,
    from: "Benin",
    to: "Sapele",
    description: "Clear",
    distance: "72 km",
    severity: "Low",
  },
];
