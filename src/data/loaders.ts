import { listIncidents } from "@/services/incidents.service";
import { listRoutes } from "@/services/routes.service";
import { toIncidentItem, toTransitCorridor } from "@/lib/mappers";
import type { IncidentItem, TransitCorridor } from "@/data/dashboard";

/**
 * Module-level so `useApiList` effects keep a stable dependency.
 */
export async function loadNearbyIncidents(): Promise<IncidentItem[]> {
  const incidents = await listIncidents();
  return incidents.map(toIncidentItem);
}

export async function loadTransitCorridors(): Promise<TransitCorridor[]> {
  const routes = await listRoutes();
  return routes.map(toTransitCorridor);
}
