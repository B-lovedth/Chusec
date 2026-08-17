"use client";

import { useEffect, useRef, useState } from "react";
import { Toggle } from "@/components/ui/Toggle";
import { startBeacon, stopBeacon, pingBeacon } from "@/services/beacons.service";
import { updateLocation } from "@/services/auth.service";
import { triggerSos } from "@/services/sos.service";
import { getCurrentCoordinates, toApiPoint } from "@/lib/geolocation";

/** The API pings on a 90s cadence, per the beacon's description. */
const PING_INTERVAL_MS = 90_000;

const TIMEOUT_OPTIONS = [5, 10, 15, 30, 60];

type StealthBeaconProps = {
  beaconActive: boolean;
  onBeaconChange: (active: boolean) => void;
};

function formatCountdown(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function StealthBeacon({ beaconActive, onBeaconChange }: StealthBeaconProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  const [deadMan, setDeadMan] = useState(false);
  const [timeoutMinutes, setTimeoutMinutes] = useState(15);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sosFired, setSosFired] = useState(false);

  const pingTimer = useRef<number | null>(null);

  /* ---------------- Silent location beacon ---------------- */

  const toggleBeacon = async (next: boolean) => {
    setError("");
    setIsBusy(true);

    try {
      if (next) {
        const coordinates = await getCurrentCoordinates();

        if (!coordinates) {
          setError("Location permission is required to start the beacon.");
          return;
        }

        // Store the position first so the dashboard has something to scope to.
        await updateLocation({ lat: coordinates.lat, lon: coordinates.lon });
        await startBeacon();
      } else {
        await stopBeacon();
      }

      onBeaconChange(next);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Could not change the beacon.");
    } finally {
      setIsBusy(false);
    }
  };

  // Keep pinging while the beacon is on so operators see a live trail.
  useEffect(() => {
    if (!beaconActive) return;

    const ping = async () => {
      const coordinates = await getCurrentCoordinates();
      if (coordinates) await pingBeacon(coordinates.lat, coordinates.lon).catch(() => undefined);
    };

    pingTimer.current = window.setInterval(ping, PING_INTERVAL_MS);

    return () => {
      if (pingTimer.current !== null) window.clearInterval(pingTimer.current);
      pingTimer.current = null;
    };
  }, [beaconActive]);

  /* ---------------- Dead man's switch ---------------- */

  /**
   * An absolute deadline rather than a decrementing counter — browsers
   * throttle timers in background tabs, and a countdown that guards a safety
   * feature must not drift.
   */
  const deadlineRef = useRef(0);
  const firedRef = useRef(false);

  const setDeadline = (minutes: number) => {
    deadlineRef.current = Date.now() + minutes * 60_000;
    firedRef.current = false;
    setSosFired(false);
    setSecondsLeft(minutes * 60);
  };

  const armDeadMan = (next: boolean) => {
    setDeadMan(next);
    if (next) setDeadline(timeoutMinutes);
    else setSecondsLeft(0);
  };

  const checkIn = () => setDeadline(timeoutMinutes);

  useEffect(() => {
    if (!deadMan) return;

    const tick = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining > 0 || firedRef.current) return;

      firedRef.current = true;
      setSosFired(true);

      getCurrentCoordinates()
        .then((coordinates) => triggerSos({ ...toApiPoint(coordinates), method: "dead_man_switch" }))
        .catch(() => setError("The dead man's switch fired but the SOS could not be sent."));
    }, 1000);

    return () => window.clearInterval(tick);
  }, [deadMan]);

  return (
    <>
      <div className="settings-intro">
        <h2>Stealth Beacon</h2>
        <p>Broadcasts your GPS even when your screen is off</p>
      </div>

      {error && (
        <div className="auth-status auth-status--error settings-error" role="alert">
          {error}
        </div>
      )}

      <section className="settings-row">
        <div className="settings-row__text">
          <h3>Silent location beacon</h3>
          <p>Ping GPS every 90s via SMS invisible to captors</p>
        </div>
        <Toggle
          checked={beaconActive}
          onChange={toggleBeacon}
          disabled={isBusy}
          label="Silent location beacon"
        />
      </section>

      <section className="settings-row settings-row--stacked">
        <div className="settings-row__head">
          <div className="settings-row__text">
            <h3>Dead man&apos;s switch</h3>
            <p>Auto-SOS if app not checked within timeout</p>
          </div>
          <Toggle checked={deadMan} onChange={armDeadMan} label="Dead man's switch" />
        </div>

        {deadMan && (
          <div className="settings-row__detail">
            <div className="settings-timeout">
              <span>Trigger after</span>
              <select
                value={timeoutMinutes}
                onChange={(event) => {
                  const minutes = Number(event.target.value);
                  setTimeoutMinutes(minutes);
                  // Must move the deadline too, not just the displayed count.
                  setDeadline(minutes);
                }}
                aria-label="Trigger after"
              >
                {TIMEOUT_OPTIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} min
                  </option>
                ))}
              </select>
              <span>of silence</span>
            </div>

            <div className="settings-countdown">
              <span className={secondsLeft <= 60 ? "settings-countdown__time is-urgent" : "settings-countdown__time"}>
                {sosFired ? "SOS sent" : formatCountdown(secondsLeft)}
              </span>
              <button type="button" className="btn btn--ghost" onClick={checkIn}>
                I&apos;m safe — reset
              </button>
            </div>

            <p className="settings-caveat">
              The countdown only runs while this tab is open. Closing it stops the switch.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
