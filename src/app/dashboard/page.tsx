import { Navbar } from "@/components/layout/Navbar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MapCard } from "@/components/dashboard/MapCard";
import { ActiveCorridorAlert } from "@/components/dashboard/ActiveCorridorAlert";
import { NearbyIncidents } from "@/components/dashboard/NearbyIncidents";
import { TransitCorridors } from "@/components/dashboard/TransitCorridors";
import { SOSButton } from "@/components/dashboard/SOSButton";

export default function DashboardPage() {
  return (
    <>
      <Navbar />

      <main className="dashboard-page">
        <DashboardHeader />
        <MapCard />
        <ActiveCorridorAlert />
        <NearbyIncidents />
        <TransitCorridors />
      </main>

      <SOSButton />
    </>
  );
}
