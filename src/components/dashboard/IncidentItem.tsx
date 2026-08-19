import type { IncidentItem as IncidentItemType } from "@/data/dashboard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";

type IncidentItemProps = {
  incident: IncidentItemType;
  /** Omitted when the row has nowhere to point — it then renders as plain text. */
  onSelect?: (id: string) => void;
  isSelected?: boolean;
};

export function IncidentItem({ incident, onSelect, isSelected = false }: IncidentItemProps) {
  const body = (
    <>
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
    </>
  );

  if (!onSelect) return <div className="list-row">{body}</div>;

  return (
    <button
      type="button"
      className={isSelected ? "list-row list-row--action is-selected" : "list-row list-row--action"}
      onClick={() => onSelect(String(incident.id))}
      aria-pressed={isSelected}
      aria-label={`Show ${incident.title} on the map`}
    >
      {body}
    </button>
  );
}
