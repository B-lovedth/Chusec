"use client";

import { ListState } from "@/components/ui/ListState";
import { useApiList } from "@/hooks/useApiList";
import { loadIncidentHistory } from "@/data/loaders";

export default function UnitHistoryPage() {
  const { status, items, error } = useApiList(loadIncidentHistory);

  return (
    <main className="page-card page-card--no-tabbar">
      <h1 className="command-title">History</h1>

      <section className="command-panel">
        <div className="command-panel__head">
          <h2>Closed cases</h2>
        </div>

        <div className="table-shell">
          <div className="queue__list">
            <ListState
              status={status}
              error={error}
              isEmpty={items.length === 0}
              emptyMessage="No closed cases yet."
              skeletonRows={5}
            >
              {items.map((incident) => (
                <div className="queue-item" key={incident.id}>
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
                    <span className="badge-resolved">Resolved</span>
                  </div>
                </div>
              ))}
            </ListState>
          </div>
        </div>
      </section>
    </main>
  );
}
