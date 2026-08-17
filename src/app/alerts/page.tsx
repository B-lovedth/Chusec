"use client";

import { PageShell } from "@/components/layout/PageShell";
import { AlertList } from "@/components/alerts/AlertList";
import { useCitizenData } from "@/components/citizen/CitizenDataProvider";

export default function AlertsPage() {
  const { city } = useCitizenData();

  return (
    <PageShell title="Alerts" location={city}>
      <AlertList />
    </PageShell>
  );
}
