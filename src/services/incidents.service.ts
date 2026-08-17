import { apiRequest } from "./api";
import type {
  BackupRequestResponse,
  IncidentClearanceReport,
  IncidentResponse,
  ReportCreate,
  ReportResponse,
} from "./types";

export async function listIncidents(): Promise<IncidentResponse[]> {
  return apiRequest<IncidentResponse[]>("/api/incidents");
}

export async function getIncident(id: number): Promise<IncidentResponse> {
  return apiRequest<IncidentResponse>(`/api/incidents/${id}`);
}

/** Public endpoint — this is what the Report screen posts to. */
export async function submitReport(payload: ReportCreate): Promise<ReportResponse> {
  return apiRequest<ReportResponse>("/api/reports", {
    method: "POST",
    body: payload,
    anonymous: true,
  });
}

export async function listIncidentHistory(limit?: number): Promise<IncidentResponse[]> {
  return apiRequest<IncidentResponse[]>("/api/incidents/history", {
    params: limit ? { limit } : undefined,
  });
}

/* ------------------------------------------------------------------ *
 * Command centre actions — all take query params, no request body.
 * ------------------------------------------------------------------ */

export async function dispatchUnit(incidentId: number, unitName: string): Promise<unknown> {
  return apiRequest<unknown>(`/api/incidents/${incidentId}/dispatch`, {
    method: "POST",
    params: { unit_name: unitName },
  });
}

export async function broadcastIncident(incidentId: number, rangeKm: number): Promise<unknown> {
  return apiRequest<unknown>(`/api/incidents/${incidentId}/broadcast`, {
    method: "POST",
    params: { range_km: rangeKm },
  });
}

export async function resolveIncident(incidentId: number, successful = true): Promise<unknown> {
  return apiRequest<unknown>(`/api/incidents/${incidentId}/resolve`, {
    method: "POST",
    params: { successful },
  });
}

export async function updateIncidentSeverity(incidentId: number, severity: string): Promise<unknown> {
  return apiRequest<unknown>(`/api/incidents/${incidentId}/severity`, {
    method: "PATCH",
    body: { severity },
  });
}

/* ------------------------------------------------------------------ *
 * Responding-unit actions
 * ------------------------------------------------------------------ */

/** Incidents assigned to the signed-in unit. */
export async function listAssignedIncidents(): Promise<IncidentResponse[]> {
  return apiRequest<IncidentResponse[]>("/api/incidents/assigned/me");
}

export async function updateUnitStatus(incidentId: number, status: string): Promise<unknown> {
  return apiRequest<unknown>(`/api/incidents/${incidentId}/unit-status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function requestBackup(incidentId: number, notes?: string): Promise<BackupRequestResponse> {
  return apiRequest<BackupRequestResponse>(`/api/incidents/${incidentId}/request-backup`, {
    method: "POST",
    body: { notes: notes ?? null },
  });
}

export async function listBackupHistory(incidentId: number): Promise<BackupRequestResponse[]> {
  return apiRequest<BackupRequestResponse[]>(`/api/incidents/${incidentId}/backup-history`);
}

export async function dispatchBackup(
  incidentId: number,
  requestId: number,
  payload: { backup_unit_id?: number | null; backup_unit_callsign?: string | null },
): Promise<unknown> {
  return apiRequest<unknown>(`/api/incidents/${incidentId}/backup-requests/${requestId}/dispatch`, {
    method: "POST",
    body: payload,
  });
}

/** Closes the incident with the responding unit's clearance report. */
export async function clearIncident(
  incidentId: number,
  report: IncidentClearanceReport,
): Promise<unknown> {
  return apiRequest<unknown>(`/api/incidents/${incidentId}/clear-incident`, {
    method: "POST",
    body: report,
  });
}

/** Evidence upload requires a token, so anonymous reports cannot carry files. */
export async function uploadEvidence(file: File, incidentId?: string): Promise<unknown> {
  const form = new FormData();
  form.append("file", file);
  if (incidentId) form.append("incident_id", incidentId);

  return apiRequest<unknown>("/api/evidence/upload", {
    method: "POST",
    body: form,
  });
}
