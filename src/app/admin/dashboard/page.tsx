"use client";

import { useCallback, useEffect, useState } from "react";
import { StatCards } from "@/components/admin/StatCards";
import { IncidentQueue } from "@/components/admin/IncidentQueue";
import { CommandMap } from "@/components/admin/CommandMap";
import { IncidentDetailPanel } from "@/components/admin/IncidentDetailPanel";
import { IncidentsPerHourChart, WeeklyResolutionChart, type WeeklySeries } from "@/components/admin/Charts";
import { ListState } from "@/components/ui/ListState";
import { useApiList } from "@/hooks/useApiList";
import { loadCommandIncidents, loadSecurityUnits } from "@/data/loaders";
import { getAnalytics, getDashboardStats } from "@/services/dashboard.service";
import { toCommandStats, toHourlySeries } from "@/lib/admin-mappers";
import { listIncidents } from "@/services/incidents.service";
import type { CommandStat } from "@/data/admin";

export default function CommandDashboardPage() {
  const { status, items: incidents, error, reload } = useApiList(loadCommandIncidents);
  const { items: fieldUnits } = useApiList(loadSecurityUnits);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [stats, setStats] = useState<CommandStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsNonce, setStatsNonce] = useState(0);
  const [hourly, setHourly] = useState<number[]>([]);
  const [weekly, setWeekly] = useState<WeeklySeries[]>([]);

  useEffect(() => {
    let cancelled = false;

    getDashboardStats()
      .then((value) => {
        if (cancelled) return;
        setStats(toCommandStats(value));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });

    getAnalytics()
      .then((value) => {
        if (cancelled) return;
        setWeekly(
          value.labels.map((day, index) => ({
            day,
            incidents: value.incidents[index] ?? 0,
            dispatched: value.dispatched[index] ?? 0,
          })),
        );
      })
      .catch(() => undefined);

    // Hourly buckets are derived from the raw feed — the API has no hourly series.
    listIncidents()
      .then((value) => {
        if (!cancelled) setHourly(toHourlySeries(value));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [statsNonce]);

  const select = useCallback((id: string) => setSelectedId(id), []);

  /** A resolved incident leaves the active queue, so re-pull both the list
   *  and the counters instead of leaving stale data on screen. */
  const handleResolved = useCallback(() => {
    setSelectedId(null);
    reload();
    setStatsNonce((value) => value + 1);
  }, [reload]);

  const selected = incidents.find((incident) => incident.id === selectedId) ?? incidents[0] ?? null;

  return (
    <main className="page-card">
      <StatCards stats={stats} isLoading={statsLoading} />

      <h1 className="command-title">Command Centre · Delta State</h1>

      <div className="command-grid">
        <IncidentQueue
          incidents={incidents}
          selectedId={selected?.id ?? ""}
          onSelect={select}
          status={status}
          error={error}
        />

        <div>
          <CommandMap
            incidents={incidents}
            selectedId={selected?.id ?? ""}
            onSelect={select}
            units={fieldUnits}
          />
          <IncidentsPerHourChart series={hourly} />
          <WeeklyResolutionChart data={weekly} />
        </div>

        {selected ? (
          <IncidentDetailPanel incident={selected} key={selected.id} onResolved={handleResolved} />
        ) : (
          <section className="detail-panel">
            <div className="detail-body">
              <ListState
                status={status}
                error={error}
                isEmpty={incidents.length === 0}
                emptyMessage="No active incidents."
                skeletonRows={2}
              >
                {null}
              </ListState>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
