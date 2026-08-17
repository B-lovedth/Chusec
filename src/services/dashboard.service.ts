import { apiRequest } from "./api";
import type {
  AnalyticsResponse,
  CitizenDashboardResponse,
  CreateMemberRequest,
  DashboardStats,
  MemberResponse,
  SystemStatus,
  UnitResponse,
} from "./types";

/**
 * One request for the whole citizen dashboard. It carries no parameters — it
 * reads the coordinates last stored by `POST /api/auth/location`, so location
 * must be pushed first for the response to be scoped to the user.
 */
export async function getCitizenDashboard(): Promise<CitizenDashboardResponse> {
  return apiRequest<CitizenDashboardResponse>("/api/dashboard/citizen");
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>("/api/dashboard/stats");
}

export async function getSystemStatuses(): Promise<SystemStatus[]> {
  return apiRequest<SystemStatus[]>("/api/dashboard/systems");
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  return apiRequest<AnalyticsResponse>("/api/dashboard/analytics");
}

export async function getFieldUnits(): Promise<UnitResponse[]> {
  return apiRequest<UnitResponse[]>("/api/dashboard/units");
}

/* ------------------------------------------------------------------ *
 * Members — backs the User Access screen
 * ------------------------------------------------------------------ */

export async function listMembers(): Promise<MemberResponse[]> {
  return apiRequest<MemberResponse[]>("/api/dashboard/members");
}

export async function createMember(payload: CreateMemberRequest): Promise<MemberResponse> {
  return apiRequest<MemberResponse>("/api/dashboard/members", { method: "POST", body: payload });
}

export async function deleteMember(memberId: number): Promise<unknown> {
  return apiRequest<unknown>(`/api/dashboard/members/${memberId}`, { method: "DELETE" });
}
