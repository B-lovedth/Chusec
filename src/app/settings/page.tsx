"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { DeleteAccountPanel } from "@/components/profile/DeleteAccountPanel";
import { StealthBeacon } from "@/components/settings/StealthBeacon";
import { LogoutRow } from "@/components/settings/LogoutRow";
import { useCitizenData } from "@/components/citizen/CitizenDataProvider";

type SettingsTab = "profile" | "beacon";

export default function SettingsPage() {
  const { city, data } = useCitizenData();
  const [tab, setTab] = useState<SettingsTab>("profile");
  // The API is the source of truth until the user flips it in this session.
  const [beaconOverride, setBeaconOverride] = useState<boolean | null>(null);
  const beaconActive = beaconOverride ?? data?.is_beacon_active ?? false;

  return (
    <main className="page-card">
      <div className="settings-head">
        <div className="settings-tabs" role="tablist" aria-label="Settings sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "profile"}
            className={tab === "profile" ? "settings-tab is-active" : "settings-tab"}
            onClick={() => setTab("profile")}
          >
            My Profile
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "beacon"}
            className={tab === "beacon" ? "settings-tab is-active" : "settings-tab"}
            onClick={() => setTab("beacon")}
          >
            Stealth Beacon
          </button>
        </div>

        <span className="location-chip" aria-label={`Current location: ${city}`}>
          <MapPin size={15} strokeWidth={2} />
          {city}
        </span>
      </div>

      {tab === "profile" ? (
        <>
          <ProfileForm />
          <DeleteAccountPanel />
        </>
      ) : (
        <StealthBeacon beaconActive={beaconActive} onBeaconChange={setBeaconOverride} />
      )}

      {/* Reachable from either tab — hidden on desktop, where the nav has it. */}
      <LogoutRow />
    </main>
  );
}
