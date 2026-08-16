export type AlertTone = "critical" | "high" | "medium" | "info";

export type SafetyAlert = {
  id: number;
  location: string;
  message: string;
  time: string;
  tone: AlertTone;
  read: boolean;
};

