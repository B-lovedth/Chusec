"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { CaseReviewModal } from "@/components/unit/CaseReviewModal";
import { totalCasualties } from "@/components/admin/IncidentOutcomeSummary";
import { ListState } from "@/components/ui/ListState";
import { getUnitDashboard } from "@/services/dashboard.service";
import { toAssignedIncident } from "@/lib/admin-mappers";
import type { UnitAssignedIncidentResponse } from "@/services/types";

export default function UnitHistoryPage() {
  const [records, setRecords] = useState<UnitAssignedIncidentResponse[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // The unit's own closed cases, from the same payload as its dashboard —
    // `/api/incidents/history` is the command-wide log, not this unit's.
    getUnitDashboard()
      .then((dashboard) => {
        if (cancelled) return;
        setRecords(dashboard.resolved_incidents);
        setStatus("ready");
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setError(fetchError instanceof Error ? fetchError.message : "Could not load your history.");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const incidents = useMemo(() => records.map(toAssignedIncident), [records]);
  const reviewing = incidents.find((incident) => incident.id === reviewingId) ?? null;

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
              isEmpty={incidents.length === 0}
              emptyMessage="No closed cases yet."
              skeletonRows={5}
            >
              {incidents.map((incident) => {
                const casualties = totalCasualties(incident.outcome);

                return (
                  <button
                    type="button"
                    className="queue-item queue-item--review"
                    key={incident.id}
                    onClick={() => setReviewingId(incident.id)}
                    aria-label={`Review ${incident.reference} — ${incident.title}`}
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

                        {/* A closed case is mostly read for its outcome. */}
                        <p className="queue-item__outcome">
                          {incident.outcome.criminalsArrested > 0
                            ? `${incident.outcome.criminalsArrested} arrested`
                            : "No arrests"}
                          {casualties > 0
                            ? ` · ${casualties} casualt${casualties === 1 ? "y" : "ies"}`
                            : " · no casualties"}
                        </p>
                      </div>

                      <span className="queue-item__tail">
                        <span className="badge-resolved">Resolved</span>
                        <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </ListState>
          </div>
        </div>
      </section>

      {reviewing && (
        <CaseReviewModal incident={reviewing} onClose={() => setReviewingId(null)} />
      )}
    </main>
  );
}
