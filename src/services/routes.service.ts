import { apiRequest } from "./api";
import type { RouteResponse } from "./types";

/** Public endpoint — powers the Transit Corridors panel. */
export async function listRoutes(): Promise<RouteResponse[]> {
  return apiRequest<RouteResponse[]>("/api/routes", { anonymous: true });
}
