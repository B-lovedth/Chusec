"use client";

import { PageShell } from "@/components/layout/PageShell";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useUser } from "@/components/auth/RouteGuard";

export default function UnitProfilePage() {
  const user = useUser();

  return (
    <PageShell title="My Profile" location={user.location}>
      <ProfileForm />
    </PageShell>
  );
}
