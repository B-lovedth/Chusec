import { apiRequest } from "./api";
import type { UnitMessageCreate, UnitMessageResponse } from "./types";

/**
 * The mesh channel is a single shared board rather than per-incident threads —
 * the API takes no incident filter, so every unit sees the same traffic.
 */
export async function listUnitMessages(): Promise<UnitMessageResponse[]> {
  return apiRequest<UnitMessageResponse[]>("/api/unit-messages");
}

export async function sendUnitMessage(payload: UnitMessageCreate): Promise<UnitMessageResponse> {
  return apiRequest<UnitMessageResponse>("/api/unit-messages", {
    method: "POST",
    body: { channel: "mesh", ...payload },
  });
}
