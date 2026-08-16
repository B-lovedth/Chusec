import { apiRequest } from "./api";
import type { AnalyticsResponse, DashboardStats, SystemStatus, UnitResponse } from "./types";

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
