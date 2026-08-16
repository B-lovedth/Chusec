import { apiRequest } from "./api";
import type { IncidentResponse, ReportCreate, ReportResponse } from "./types";

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

export async function requestBackup(incidentId: number): Promise<unknown> {
  return apiRequest<unknown>(`/api/incidents/${incidentId}/backup`, { method: "POST" });
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
