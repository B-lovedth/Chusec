import { nearbyIncidents } from "@/data/dashboard";
import { IncidentItem } from "@/components/dashboard/IncidentItem";

export function NearbyIncidents() {
  return (
    <section className="panel-section">
      <div className="section-heading">
        <h3>Nearby Incidents</h3>
      </div>

      <div className="incident-list">
        {nearbyIncidents.map((incident) => (
          <IncidentItem key={incident.id} incident={incident} />
        ))}
      </div>
    </section>
  );
}
