"use client";

import { SeverityBadge } from "@/components/ui/SeverityBadge";
import type { CommandIncident } from "@/data/admin";

type IncidentQueueProps = {
  incidents: CommandIncident[];
  selectedId: string;
  onSelect: (id: string) => void;
};

function QueueTag({ incident }: { incident: CommandIncident }) {
  if (incident.tag.kind === "sos") return <span className="badge-sos">SOS</span>;
  if (incident.tag.kind === "resolved") return <span className="badge-resolved">Resolved</span>;
  return <SeverityBadge severity={incident.tag.value} />;
}

export function IncidentQueue({ incidents, selectedId, onSelect }: IncidentQueueProps) {
  return (
    <section className="queue">
      <div className="queue__head">
        <h2>Incidents</h2>
        <span className="badge-new">New</span>
      </div>

      <div className="queue__list">
        {incidents.map((incident) => (
          <button
            type="button"
            key={incident.id}
            className={incident.id === selectedId ? "queue-item is-selected" : "queue-item"}
            onClick={() => onSelect(incident.id)}
            aria-current={incident.id === selectedId}
          >
            <div className="queue-item__top">
              <span>{incident.reference}</span>
              <span>
                {incident.date} &nbsp;{incident.time}
              </span>
            </div>

            <div className="queue-item__body">
              <div>
                <h3 className="queue-item__title">{incident.title}</h3>
                <p className="queue-item__location">{incident.location}</p>
              </div>
              <QueueTag incident={incident} />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
