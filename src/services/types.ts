/** Mirrors the schemas in https://chusec.onrender.com/openapi.json (Chusec API 0.1.0). */

export type UserResponse = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  nin: string | null;
  emergency_contact: string | null;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  callsign: string | null;
  avatar_url: string | null;
  lat: number | null;
  lon: number | null;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  pin?: string | null;
  role?: string | null;
  callsign?: string | null;
};

export type ProfileUpdateRequest = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  nin?: string | null;
  emergency_contact?: string | null;
  avatar_url?: string | null;
};

export type IncidentResponse = {
  id: number;
  type: string;
  x: number;
  y: number;
  location_name: string;
  severity: string;
  report_count: number;
  is_sos: boolean;
  is_beacon: boolean;
  successful: boolean;
  lat: number | null;
  lon: number | null;
  time: string;
  created_at: string;
};

export type RouteResponse = {
  id: number;
  name: string;
  risk_level: string;
  risk_pct: number;
  incident_count: number;
  distance_km: string;
  color: string;
};

export type ReportCreate = {
  incident_type: string;
  note?: string | null;
  x?: number | null;
  y?: number | null;
};

export type ReportResponse = ReportCreate & {
  id: number;
  created_at: string;
};

export type SOSCreate = {
  x: number;
  y: number;
  lat?: number | null;
  lon?: number | null;
  method?: string;
};

export type SOSResponse = SOSCreate & {
  id: number;
  created_at: string;
};

export type DashboardStats = {
  active_incidents: number;
  critical_alerts: number;
  citizen_reports: number;
  units_dispatched: number;
  active_beacons: number;
  resolved_incidents: number;
  successful_incidents: number;
  unsuccessful_incidents: number;
  intercept_rate: number;
};

export type SystemStatus = {
  name: string;
  active: boolean;
};

export type AnalyticsResponse = {
  labels: string[];
  incidents: number[];
  dispatched: number[];
};

export type UnitResponse = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  callsign: string | null;
  avatar_url: string | null;
  lat: number | null;
  lon: number | null;
  agency: string | null;
  lga: string | null;
  address: string | null;
  notes: string | null;
  responding_unit: string | null;
  team_lead: string | null;
  responders: string | null;
  vehicles: string | null;
};
