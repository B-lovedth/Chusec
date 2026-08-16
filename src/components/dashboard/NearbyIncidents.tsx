"use client";

import { nearbyIncidents } from "@/data/dashboard";
import { loadNearbyIncidents } from "@/data/loaders";
import { useApiList } from "@/hooks/useApiList";
import { IncidentItem } from "@/components/dashboard/IncidentItem";
import { ListSkeleton } from "@/components/ui/ListSkeleton";

export function NearbyIncidents() {
  const { status, items } = useApiList(loadNearbyIncidents, nearbyIncidents);

  return (
    <section className="panel panel--first">
      <h2 className="panel__title">Nearby Incidents</h2>

      <div className="list-card">
        {status === "loading" ? (
          <ListSkeleton rows={3} />
        ) : (
          items.map((incident) => <IncidentItem key={incident.id} incident={incident} />)
        )}
      </div>
    </section>
  );
}
