import { apiRequest } from "./api";

export type IncidentReport = {
  id: number;
  title: string;
  description: string;
  location: string;
  status: "open" | "under_review" | "resolved";
};

export async function getIncidentReports(): Promise<IncidentReport[]> {
  return apiRequest<IncidentReport[]>("/posts");
}

export async function reportIncident(payload: Omit<IncidentReport, "id" | "status">): Promise<IncidentReport> {
  return apiRequest<IncidentReport>("/posts", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      status: "open",
      userId: Date.now(),
    }),
  });
}
