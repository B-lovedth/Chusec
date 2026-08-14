import { MapPin } from "lucide-react";
import { currentUser } from "@/data/dashboard";

export function DashboardHeader() {
  return (
    <div className="dashboard-header">
      <div>
        <h1 className="dashboard-header__title">Hello {currentUser.name}</h1>
        <p className="dashboard-header__subtitle">Welcome back</p>
      </div>

      <div className="location-pill" aria-label="Current location">
        <MapPin size={14} strokeWidth={2.2} />
        <span>{currentUser.location}</span>
      </div>
    </div>
  );
}
