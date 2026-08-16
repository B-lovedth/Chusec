"use client";

import { PageShell } from "@/components/layout/PageShell";
import { OperatorProfile } from "@/components/admin/OperatorProfile";
import { useUser } from "@/components/auth/RouteGuard";

export default function CommandProfilePage() {
  const user = useUser();

  return (
    <PageShell title="My Profile" location={user.location}>
      <OperatorProfile />
    </PageShell>
  );
}
