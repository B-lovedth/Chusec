import { PageShell } from "@/components/layout/PageShell";
import { MapCard } from "@/components/dashboard/MapCard";
import { ActiveCorridorAlert } from "@/components/dashboard/ActiveCorridorAlert";
import { NearbyIncidents } from "@/components/dashboard/NearbyIncidents";
import { TransitCorridors } from "@/components/dashboard/TransitCorridors";
import { currentUser } from "@/data/dashboard";

export default function DashboardPage() {
  return (
    <PageShell title={`Hello ${currentUser.firstName}`} subtitle="Welcome back" location={currentUser.location}>
      <MapCard />
      <ActiveCorridorAlert />
      <NearbyIncidents />
      <TransitCorridors />
    </PageShell>
  );
}
