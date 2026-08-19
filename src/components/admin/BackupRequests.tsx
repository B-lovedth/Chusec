"use client";

import { useCallback, useEffect, useState } from "react";
import { LifeBuoy } from "lucide-react";
import { useServerTick } from "@/hooks/useServerTick";
import { formatDuration, parseApiDate, secondsBetween } from "@/lib/server-clock";
import {
  cancelBackupRequest,
  dispatchBackupUnit,
  listBackupHistory,
} from "@/services/incidents.service";
import type { BackupRequestResponse } from "@/services/types";
import type { SecurityUnit } from "@/data/admin";
import { toBackupStage } from "@/lib/backup";

const POLL_INTERVAL_MS = 15_000;

/** Matches the API default; command can override per dispatch. */
const DEFAULT_ETA_MINUTES = 5;

type BackupRequestsProps = {
  incidentId: number;
  units: SecurityUnit[];
};

/**
 * Command's side of the backup flow. A unit in the field raises a request and
 * then watches a clock; this is where someone answers it.
 */
export function BackupRequests({ incidentId, units }: BackupRequestsProps) {
  const [requests, setRequests] = useState<BackupRequestResponse[]>([]);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [choice, setChoice] = useState<Record<number, string>>({});
  const [eta, setEta] = useState<Record<number, number>>({});
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    listBackupHistory(incidentId)
      .then((history) => {
        if (!cancelled) setRequests(history);
      })
      .catch(() => {
        // Backup history is supplementary — it must not blank the panel.
      });

    return () => {
      cancelled = true;
    };
  }, [incidentId, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  const waiting = requests.filter((request) => toBackupStage(request) === "pending");

  // Only ticks while someone is actually waiting on an answer.
  const now = useServerTick(waiting.length > 0);

  useEffect(() => {
    if (waiting.length === 0) return;

    const timer = window.setInterval(reload, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [waiting.length, reload]);

  const run = async (requestId: number, action: () => Promise<unknown>, failure: string) => {
    setError("");
    setPendingId(requestId);

    try {
      await action();
      reload();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : failure);
    } finally {
      setPendingId(null);
    }
  };

  const dispatch = (request: BackupRequestResponse) => {
    const unit = units.find((candidate) => candidate.id === choice[request.id]);
    if (!unit) {
      setError("Pick a unit to send.");
      return;
    }

    run(
      request.id,
      () =>
        dispatchBackupUnit(incidentId, request.id, {
          backup_unit_id: Number(unit.id),
          backup_unit_callsign: unit.callsign ?? unit.name,
          // The unit in the field sees this as its arrival estimate.
          eta_minutes: eta[request.id] ?? DEFAULT_ETA_MINUTES,
        }),
      "Could not dispatch that unit.",
    );
  };

  const cancel = (request: BackupRequestResponse) =>
    run(
      request.id,
      () => cancelBackupRequest(incidentId, request.id),
      "Could not stand that request down.",
    );

  if (requests.length === 0) return null;

  return (
    <div className="detail-body">
      <p className="detail-section-label">
        <LifeBuoy size={14} strokeWidth={2} aria-hidden="true" /> Backup requests
      </p>

      {error && (
        <div className="auth-status auth-status--error detail-action-error" role="alert">
          {error}
        </div>
      )}

      {requests.map((request) => {
        const requestedAt = parseApiDate(request.requested_at);
        const dispatchedAt = parseApiDate(request.dispatched_at);
        const stage = toBackupStage(request);
        const isPending = stage === "pending";

        return (
          <article
            className={isPending ? "backup-request is-waiting" : "backup-request"}
            key={request.id}
          >
            <div className="backup-request__head">
              <span className="backup-request__from">{request.requesting_unit_callsign}</span>
              <span className="backup-request__clock">
                {/* Live while pending, frozen at the server's figure after. */}
                {isPending
                  ? formatDuration(secondsBetween(requestedAt, now))
                  : (request.response_time_formatted ??
                    formatDuration(secondsBetween(requestedAt, dispatchedAt)))}
              </span>
            </div>

            {request.notes && <p className="backup-request__notes">{request.notes}</p>}

            {isPending ? (
              <div className="backup-request__action">
                <span className="control">
                  <select
                    className="control__select"
                    value={choice[request.id] ?? ""}
                    onChange={(event) =>
                      setChoice((current) => ({ ...current, [request.id]: event.target.value }))
                    }
                    aria-label={`Unit to send to ${request.requesting_unit_callsign}`}
                  >
                    <option value="">Select a unit</option>
                    {units
                      .filter((unit) => String(unit.id) !== String(request.requesting_unit_id))
                      .map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.callsign ?? unit.name}
                        </option>
                      ))}
                  </select>
                </span>

                <span className="control backup-request__eta">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={eta[request.id] ?? DEFAULT_ETA_MINUTES}
                    onChange={(event) =>
                      setEta((current) => ({
                        ...current,
                        [request.id]: Number(event.target.value),
                      }))
                    }
                    aria-label="Estimated arrival, in minutes"
                  />
                  <span className="backup-request__eta-suffix">min</span>
                </span>

                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => dispatch(request)}
                  disabled={pendingId === request.id}
                >
                  {pendingId === request.id ? "Sending..." : "Dispatch"}
                </button>

                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => cancel(request)}
                  disabled={pendingId === request.id}
                >
                  Stand down
                </button>
              </div>
            ) : (
              <p className="backup-request__resolved">
                {stage === "cancelled"
                  ? "Stood down."
                  : `${request.backup_unit_callsign ?? "A unit"} ${
                      stage === "arrived" ? "arrived on scene." : "is en route."
                    }${stage === "dispatched" && request.eta_formatted ? ` · ETA ${request.eta_formatted}` : ""}`}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
