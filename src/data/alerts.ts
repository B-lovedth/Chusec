export type AlertTone = "critical" | "high" | "medium" | "info";

export type SafetyAlert = {
  id: number;
  location: string;
  message: string;
  time: string;
  tone: AlertTone;
  read: boolean;
};

export const safetyAlerts: SafetyAlert[] = [
  {
    id: 1,
    location: "Warri",
    message: "CRITICAL: Armed robbery in progress - Warri-Sapele Road, Avoid area.",
    time: "14:33",
    tone: "critical",
    read: false,
  },
  {
    id: 2,
    location: "Asaba",
    message: "WARNING: Fake checkpoint 12 km from Asaba on Agbor Expressway",
    time: "13:20",
    tone: "medium",
    read: false,
  },
  {
    id: 3,
    location: "Benin City",
    message: "ALERT: Benin-Auchi high-alert corridor - active threat at Km 42",
    time: "13:20",
    tone: "critical",
    read: true,
  },
  {
    id: 4,
    location: "Ughelli",
    message: "UPDATE: Ughelli Market - police deployed, risk downgraded to MEDIUM.",
    time: "13:20",
    tone: "info",
    read: true,
  },
];
