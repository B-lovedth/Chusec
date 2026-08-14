import type { IncidentItem as IncidentItemType } from "@/data/dashboard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";

type IncidentItemProps = {
  incident: IncidentItemType;
};

export function IncidentItem({ incident }: IncidentItemProps) {
  return (
    <div className="list-row">
      <div className="list-row__lead">
        <span
          className={`severity-dot severity-dot--${incident.severity.toLowerCase()}`}
          aria-hidden="true"
        />
        <div>
          <h4 className="list-row__title">{incident.title}</h4>
          <p className="list-row__meta">
            {incident.distance} · {incident.time}
          </p>
        </div>
      </div>

      <SeverityBadge severity={incident.severity} />
    </div>
  );
}
