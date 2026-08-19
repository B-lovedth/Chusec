import { apiRequest } from "./api";
import type { SOSCancelRequest, SOSCreate, SOSResponse } from "./types";

/** Public endpoint so an SOS still goes out when the session has expired. */
export async function triggerSos(payload: SOSCreate): Promise<SOSResponse> {
  return apiRequest<SOSResponse>("/api/sos", {
    method: "POST",
    body: { method: "button", ...payload },
    anonymous: true,
  });
}

/** Stands the beacon down. Without this the alert stays open on the backend. */
export async function cancelSos(id: number, payload: SOSCancelRequest = {}): Promise<SOSResponse> {
  return apiRequest<SOSResponse>(`/api/sos/${id}/cancel`, {
    method: "POST",
    body: payload,
  });
}

/**
 * Cancels and attaches the ambient recording in one request, so a cancellation
 * made under coercion still reaches command with the audio that goes with it.
 */
export async function cancelSosWithAudio(id: number, audio: File): Promise<SOSResponse> {
  const form = new FormData();
  form.append("audio_file", audio);

  return apiRequest<SOSResponse>(`/api/sos/${id}/cancel-with-audio`, {
    method: "POST",
    body: form,
  });
}

/** Uploads a duress clip against a still-active SOS. */
export async function uploadDuressAudio(id: number, audio: File): Promise<SOSResponse> {
  const form = new FormData();
  form.append("audio_file", audio);

  return apiRequest<SOSResponse>(`/api/sos/${id}/duress-audio`, {
    method: "POST",
    body: form,
  });
}
