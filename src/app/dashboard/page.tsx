"use client";

import { PageShell } from "@/components/layout/PageShell";
import { MapCard } from "@/components/dashboard/MapCard";
import { ActiveCorridorAlert } from "@/components/dashboard/ActiveCorridorAlert";
import { NearbyIncidents } from "@/components/dashboard/NearbyIncidents";
import { TransitCorridors } from "@/components/dashboard/TransitCorridors";
import { useUser } from "@/components/auth/RouteGuard";

export default function DashboardPage() {
  const user = useUser();

  return (
    <PageShell
      title={`Hello ${user.firstName}`}
      subtitle="Welcome back"
      location={user.location}
      avatar={user.avatar}
    >
      <MapCard />
      <ActiveCorridorAlert />
      <NearbyIncidents />
      <TransitCorridors />
    </PageShell>
  );
}
