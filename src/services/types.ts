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

/* ------------------------------------------------------------------ *
 * Consolidated citizen dashboard
 * ------------------------------------------------------------------ */

export type LocationUpdateRequest = {
  lat: number;
  lon: number;
  heading?: number | null;
  speed?: number | null;
};

export type ActiveSOSResponse = {
  id: number;
  created_at: string;
  is_cancelled: boolean;
  duress_recording_status: string | null;
};

export type NearbyIncidentResponse = {
  id: number;
  type: string;
  location_name: string;
  severity: string;
  distance_km: number;
  /** Pre-formatted by the API, e.g. "1.2 km". */
  distance_formatted: string;
  cardinal_direction: string;
  time_formatted: string;
  unit_status: string;
  created_at: string;
  lat: number;
  lon: number;
};

export type SeverityBreakdown = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total_active: number;
};

/** A waypoint may arrive as a pair or as a named object — see `toCorridorLine`. */
export type CorridorWaypoint =
  | [number, number]
  | { lat?: number; lon?: number; lng?: number; latitude?: number; longitude?: number };

export type TransitCorridorResponse = {
  id: number;
  name: string;
  risk_level: string;
  /** Lowercase twin of `risk_level`; preferred when present. */
  severity?: string | null;
  risk_pct: number;
  incident_count: number;
  distance_km: string;
  color: string;
  start_lat?: number | null;
  start_lon?: number | null;
  end_lat?: number | null;
  end_lon?: number | null;
  waypoints?: CorridorWaypoint[] | null;
};

export type CitizenDashboardResponse = {
  is_beacon_active: boolean;
  user_id: number;
  user_name: string;
  avatar_url: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
  unread_notifications_count: number;
  active_sos: ActiveSOSResponse | null;
  /** Set when the dashboard has nothing to scope to yet. */
  message: string | null;
  nearby_incidents: NearbyIncidentResponse[];
  severity_breakdown: SeverityBreakdown;
  active_corridor_warning: string | null;
  transit_corridors: TransitCorridorResponse[];
};

export type MemberResponse = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string | null;
};

export type CreateUnitRequest = {
  name: string;
  callsign?: string | null;
  phone?: string | null;
  email?: string | null;
  /** Defaults to "Nigeria Police Force" server-side. */
  agency?: string | null;
  state?: string | null;
  lga?: string | null;
  address?: string | null;
  notes?: string | null;
  responding_unit?: string | null;
  team_lead?: string | null;
  /** Comma-separated on the wire. */
  responders?: string | null;
  vehicles?: string | null;
  lat?: number | null;
  lon?: number | null;
  /** Omit to let the API generate one and email the credentials. */
  password?: string | null;
};

export type CreateMemberRequest = {
  email: string;
  name?: string | null;
  /** Defaults to "operator" server-side. */
  role?: string;
  password?: string | null;
};

export type BackupRequestResponse = {
  id: number;
  incident_id: number;
  requesting_unit_id: number;
  requesting_unit_callsign: string;
  requested_at: string;
  notes: string | null;
  backup_unit_id: number | null;
  backup_unit_callsign: string | null;
  dispatched_at: string | null;
  status: string;
};

export type IncidentClearanceReport = {
  victims_injured?: number;
  victims_dead?: number;
  criminals_injured?: number;
  criminals_dead?: number;
  criminals_arrested?: number;
  agents_injured?: number;
  agents_dead?: number;
  clearance_notes?: string | null;
  successful?: boolean;
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
  state?: string | null;
  lga: string | null;
  address: string | null;
  notes: string | null;
  responding_unit: string | null;
  team_lead: string | null;
  responders: string | null;
  vehicles: string | null;
};
