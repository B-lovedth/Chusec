"use client";

import { useState } from "react";
import { StatCards } from "@/components/admin/StatCards";
import { IncidentQueue } from "@/components/admin/IncidentQueue";
import { CommandMap } from "@/components/admin/CommandMap";
import { IncidentDetailPanel } from "@/components/admin/IncidentDetailPanel";
import { IncidentsPerHourChart, WeeklyResolutionChart } from "@/components/admin/Charts";
import { commandIncidents } from "@/data/admin";

export default function CommandDashboardPage() {
  const [selectedId, setSelectedId] = useState(commandIncidents[0].id);
  const selected = commandIncidents.find((incident) => incident.id === selectedId) ?? commandIncidents[0];

  return (
    <main className="page-card">
      <StatCards />

      <h1 className="command-title">Command Centre · Delta State</h1>

      <div className="command-grid">
        <IncidentQueue incidents={commandIncidents} selectedId={selectedId} onSelect={setSelectedId} />

        <div>
          <CommandMap incidents={commandIncidents} selectedId={selectedId} onSelect={setSelectedId} />
          <IncidentsPerHourChart />
          <WeeklyResolutionChart />
        </div>

        <IncidentDetailPanel incident={selected} key={selected.id} />
      </div>
    </main>
  );
}
