"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CommandMap } from "@/components/admin/CommandMap";
import { ListState } from "@/components/ui/ListState";
import { useApiList } from "@/hooks/useApiList";
import { loadIncidentHistory } from "@/data/loaders";

export default function CommandHistoryPage() {
  const { status, items, error } = useApiList(loadIncidentHistory);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;

    return items.filter(
      (incident) =>
        incident.title.toLowerCase().includes(term) ||
        incident.location.toLowerCase().includes(term) ||
        incident.reference.toLowerCase().includes(term),
    );
  }, [items, query]);

  const selected = visible.find((incident) => incident.id === selectedId) ?? visible[0] ?? null;

  return (
    <main className="page-card">
      <h1 className="command-title">History</h1>

      <div className="history-toolbar">
        <div className="control table-search">
          <span className="control__icon" aria-hidden="true">
            <Search size={16} strokeWidth={1.9} />
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search...."
            aria-label="Search resolved incidents"
          />
        </div>
      </div>

      <div className="history-grid">
        <section className="queue">
          <div className="queue__list history-list">
            <ListState
              status={status}
              error={error}
              isEmpty={visible.length === 0}
              emptyMessage="No resolved incidents yet."
              skeletonRows={6}
            >
              {visible.map((incident) => (
                <button
                  type="button"
                  key={incident.id}
                  className={incident.id === selected?.id ? "queue-item is-selected" : "queue-item"}
                  onClick={() => setSelectedId(incident.id)}
                  aria-current={incident.id === selected?.id}
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
                    <span className="badge-resolved">Resolved</span>
                  </div>
                </button>
              ))}
            </ListState>
          </div>
        </section>

        <div>
          <CommandMap
            incidents={visible}
            selectedId={selected?.id ?? ""}
            onSelect={(id) => setSelectedId(id)}
          />

          {selected && (
            <section className="history-detail">
              <div className="detail-posted">
                <span>Posted by : {selected.reportedBy}</span>
              </div>

              <p className="detail-ref">
                {selected.reference} · {selected.time}
              </p>
              <h2 className="detail-heading">{selected.title}</h2>
              <p className="detail-location">{selected.location}</p>
              <p className="detail-narrative">{selected.narrative}</p>

              {/*
                The design also shows the resolving force's call metadata,
                conversation log and response timeline. The API exposes none of
                those yet, so they are left out rather than faked.
              */}
              <p className="history-detail__note">
                Call recording, conversation log and response timeline aren&apos;t exposed by the API yet.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
