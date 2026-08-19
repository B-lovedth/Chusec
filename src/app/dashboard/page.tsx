"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { MapCard } from "@/components/dashboard/MapCard";
import { ActiveCorridorAlert } from "@/components/dashboard/ActiveCorridorAlert";
import { IncidentItem } from "@/components/dashboard/IncidentItem";
import { CorridorItem } from "@/components/dashboard/CorridorItem";
import { ListState } from "@/components/ui/ListState";
import { useUser } from "@/components/auth/RouteGuard";
import { useCitizenData } from "@/components/citizen/CitizenDataProvider";
import { toDashboardCorridor, toNearbyIncidentItem } from "@/lib/mappers";

/** Stable empties: a fresh [] each render would re-run the map effects. */
const EMPTY_INCIDENTS: never[] = [];
const EMPTY_CORRIDORS: never[] = [];

export default function DashboardPage() {
  const user = useUser();
  const { data, status, error, city } = useCitizenData();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const incidents = (data?.nearby_incidents ?? []).map(toNearbyIncidentItem);
  const corridors = (data?.transit_corridors ?? []).map(toDashboardCorridor);

  return (
    <PageShell
      title={`Hello ${data?.user_name?.split(" ")[0] ?? user.firstName}`}
      subtitle="Welcome back"
      location={city}
      avatar={user.avatar}
    >
      <MapCard
        userLocation={data?.lat != null && data?.lon != null ? { lat: data.lat, lon: data.lon } : null}
        incidents={data?.nearby_incidents ?? EMPTY_INCIDENTS}
        corridors={data?.transit_corridors ?? EMPTY_CORRIDORS}
        selectedIncidentId={selectedIncidentId}
        onSelectIncident={setSelectedIncidentId}
      />

      <ActiveCorridorAlert warning={data?.active_corridor_warning ?? null} />

      <section className="panel panel--first">
        <h2 className="panel__title">Nearby Incidents</h2>
        <div className="list-card">
          <ListState
            status={status}
            error={error}
            isEmpty={incidents.length === 0}
            emptyMessage="No incidents reported near you."
            skeletonRows={3}
          >
            {incidents.map((incident) => (
              <IncidentItem
                key={incident.id}
                incident={incident}
                onSelect={setSelectedIncidentId}
                isSelected={String(incident.id) === selectedIncidentId}
              />
            ))}
          </ListState>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">Transit Corridors</h2>
        <div className="list-card">
          <ListState
            status={status}
            error={error}
            isEmpty={corridors.length === 0}
            emptyMessage="No corridors are being tracked near you."
            skeletonRows={4}
          >
            {corridors.map((corridor) => (
              <CorridorItem key={corridor.id} corridor={corridor} />
            ))}
          </ListState>
        </div>
      </section>
    </PageShell>
  );
}
