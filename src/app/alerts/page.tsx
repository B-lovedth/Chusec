import { PageShell } from "@/components/layout/PageShell";
import { AlertList } from "@/components/alerts/AlertList";
import { currentUser } from "@/data/dashboard";

export default function AlertsPage() {
  return (
    <PageShell title="Alerts" location={currentUser.location}>
      <AlertList />
    </PageShell>
  );
}
