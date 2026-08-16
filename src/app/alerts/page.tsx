"use client";

import { PageShell } from "@/components/layout/PageShell";
import { AlertList } from "@/components/alerts/AlertList";
import { useUser } from "@/components/auth/RouteGuard";

export default function AlertsPage() {
  const user = useUser();

  return (
    <PageShell title="Alerts" location={user.location}>
      <AlertList />
    </PageShell>
  );
}
