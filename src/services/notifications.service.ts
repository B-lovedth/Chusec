import { apiRequest } from "./api";
import type { NotificationListResponse, NotificationResponse } from "./types";

/** Tailored to the caller's id and role by the API. */
export async function listNotifications(): Promise<NotificationListResponse> {
  return apiRequest<NotificationListResponse>("/api/notifications");
}

export async function markNotificationRead(id: number): Promise<NotificationResponse> {
  return apiRequest<NotificationResponse>(`/api/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead(): Promise<unknown> {
  return apiRequest<unknown>("/api/notifications/read-all", { method: "POST" });
}
