import { nearbyIncidents } from "@/data/dashboard";
import { IncidentItem } from "@/components/dashboard/IncidentItem";

export function NearbyIncidents() {
  return (
    <section className="panel panel--first">
      <h2 className="panel__title">Nearby Incidents</h2>

      <div className="list-card">
        {nearbyIncidents.map((incident) => (
          <IncidentItem key={incident.id} incident={incident} />
        ))}
      </div>
    </section>
  );
}
