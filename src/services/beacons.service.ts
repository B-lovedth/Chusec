import { apiRequest } from "./api";

/** Turns the live location beacon on so operators can see the citizen. */
export async function startBeacon(): Promise<unknown> {
  return apiRequest<unknown>("/api/beacons/start", { method: "POST" });
}

export async function stopBeacon(): Promise<unknown> {
  return apiRequest<unknown>("/api/beacons/stop", { method: "POST" });
}

/** Periodic breadcrumb while the beacon is active. */
export async function pingBeacon(lat: number, lon: number): Promise<unknown> {
  return apiRequest<unknown>("/api/beacons/ping", { method: "POST", body: { lat, lon } });
}
