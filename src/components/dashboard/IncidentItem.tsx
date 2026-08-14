import type { IncidentItem as IncidentItemType } from "@/data/dashboard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";

type IncidentItemProps = {
  incident: IncidentItemType;
};

export function IncidentItem({ incident }: IncidentItemProps) {
  return (
    <div className="incident-item">
      <div className="incident-item__meta">
        <span className="incident-item__bullet" aria-hidden="true" />
        <div className="incident-item__text">
          <h4>{incident.title}</h4>
          <small>
            {incident.distance} · {incident.time}
          </small>
        </div>
      </div>

      <SeverityBadge severity={incident.severity} />
    </div>
  );
}
