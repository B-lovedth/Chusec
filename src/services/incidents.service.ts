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
