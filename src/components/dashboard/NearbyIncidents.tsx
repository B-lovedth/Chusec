"use client";

import { loadNearbyIncidents } from "@/data/loaders";
import { useApiList } from "@/hooks/useApiList";
import { IncidentItem } from "@/components/dashboard/IncidentItem";
import { ListState } from "@/components/ui/ListState";

export function NearbyIncidents() {
  const { status, items, error } = useApiList(loadNearbyIncidents);

  return (
    <section className="panel panel--first">
      <h2 className="panel__title">Nearby Incidents</h2>

      <div className="list-card">
        <ListState
          status={status}
          error={error}
          isEmpty={items.length === 0}
          emptyMessage="No incidents reported near you."
          skeletonRows={3}
        >
          {items.map((incident) => (
            <IncidentItem key={incident.id} incident={incident} />
          ))}
        </ListState>
      </div>
    </section>
  );
}
