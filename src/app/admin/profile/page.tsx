import { PageShell } from "@/components/layout/PageShell";
import { OperatorProfile } from "@/components/admin/OperatorProfile";
import { commandOperator } from "@/data/admin";

export default function CommandProfilePage() {
  return (
    <PageShell title="My Profile" location={commandOperator.location}>
      <OperatorProfile />
    </PageShell>
  );
}
