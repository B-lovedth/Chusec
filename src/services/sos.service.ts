import { apiRequest } from "./api";
import type { SOSCreate, SOSResponse } from "./types";

/** Public endpoint so an SOS still goes out when the session has expired. */
export async function triggerSos(payload: SOSCreate): Promise<SOSResponse> {
  return apiRequest<SOSResponse>("/api/sos", {
    method: "POST",
    body: { method: "button", ...payload },
    anonymous: true,
  });
}
