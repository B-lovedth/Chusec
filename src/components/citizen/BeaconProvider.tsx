"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { pingBeacon } from "@/services/beacons.service";
import { updateLocation } from "@/services/auth.service";
import { getCurrentCoordinates, getGeolocationPermission } from "@/lib/geolocation";
import { useCitizenData } from "@/components/citizen/CitizenDataProvider";

/** Matches the beacon's stated 90s cadence. */
const PING_INTERVAL_MS = 90_000;

export type BeaconState = {
  active: boolean;
  /** Beacon is on server-side but this device isn't sharing location. */
  permissionLost: boolean;
  /** Local override so the Settings toggle responds immediately. */
  setActiveOverride: (active: boolean | null) => void;
  retry: () => Promise<void>;
};

const BeaconContext = createContext<BeaconState | null>(null);

/**
 * Owns the beacon's ping loop.
 *
 * This lives at app level rather than inside the Settings screen on purpose:
 * the loop used to be mounted with the Stealth Beacon tab, so pings stopped
 * the moment the user navigated away — even to the sibling tab — while the
 * server still reported the beacon as active. The breadcrumb trail was
 * therefore a couple of points and then silence.
 */
export function BeaconProvider({ children }: { children: ReactNode }) {
  const { data } = useCitizenData();
  const [override, setOverride] = useState<boolean | null>(null);
  const [permissionLost, setPermissionLost] = useState(false);
  const timerRef = useRef<number | null>(null);

  const active = override ?? data?.is_beacon_active ?? false;

  const setActiveOverride = useCallback((next: boolean | null) => setOverride(next), []);

  const retry = useCallback(async () => {
    const coordinates = await getCurrentCoordinates();

    if (!coordinates) {
      setPermissionLost(true);
      return;
    }

    setPermissionLost(false);
    await updateLocation({ lat: coordinates.lat, lon: coordinates.lon }).catch(() => undefined);
    await pingBeacon(coordinates.lat, coordinates.lon).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    const ping = async () => {
      const coordinates = await getCurrentCoordinates();
      if (cancelled) return;

      if (!coordinates) {
        // Browser permission does not survive a refresh, so an active beacon
        // can silently stop reporting. Say so rather than fail quietly.
        setPermissionLost(true);
        return;
      }

      setPermissionLost(false);
      await pingBeacon(coordinates.lat, coordinates.lon).catch(() => undefined);
    };

    getGeolocationPermission()
      .then((permission) => {
        if (cancelled) return;
        if (permission === "denied") {
          setPermissionLost(true);
          return;
        }
        // Ping straight away instead of waiting a full interval.
        return ping();
      })
      .catch(() => undefined);

    timerRef.current = window.setInterval(ping, PING_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [active]);

  const value = useMemo<BeaconState>(
    // Derived rather than reset in the effect: the flag only means anything
    // while the beacon is on.
    () => ({ active, permissionLost: active && permissionLost, setActiveOverride, retry }),
    [active, permissionLost, setActiveOverride, retry],
  );

  return <BeaconContext.Provider value={value}>{children}</BeaconContext.Provider>;
}

export function useBeacon(): BeaconState {
  const value = useContext(BeaconContext);
  if (!value) throw new Error("useBeacon must be used inside <BeaconProvider>");
  return value;
}
