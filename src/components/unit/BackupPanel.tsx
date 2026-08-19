"use client";

import { useCallback, useEffect, useState } from "react";
import { ConfirmBackupModal } from "@/components/unit/ConfirmBackupModal";
import { useServerTick } from "@/hooks/useServerTick";
import { formatDuration, parseApiDate, secondsBetween } from "@/lib/server-clock";
import {
  cancelBackupRequest,
  listBackupHistory,
  requestBackup,
  updateBackupStatus,
} from "@/services/incidents.service";
import type { BackupRequestResponse } from "@/services/types";
import {
  BACKUP_ARRIVED_STATUS,
  pickLatestOpenBackup,
  toBackupStage,
} from "@/lib/backup";

/** How often to ask whether command has responded yet. */
const POLL_INTERVAL_MS = 10_000;

type BackupPanelProps = {
  incidentId: number;
};

export function BackupPanel({ incidentId }: BackupPanelProps) {
  const [request, setRequest] = useState<BackupRequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isMarkingArrived, setIsMarkingArrived] = useState(false);
  const [error, setError] = useState("");
  const [nonce, setNonce] = useState(0);

  /**
   * The open request is whatever the server says it is. Nothing about this
   * panel's state lives only in the browser, which is what makes it survive a
   * reload — the timers below are derived from these timestamps, not counted.
   */
  useEffect(() => {
    let cancelled = false;

    listBackupHistory(incidentId)
      .then((history) => {
        if (cancelled) return;
        setRequest(pickLatestOpenBackup(history));
        setIsLoading(false);
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setError(
          fetchError instanceof Error ? fetchError.message : "Could not read the backup status.",
        );
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [incidentId, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  // A stood-down request is the same as no request at all, so the panel goes
  // back to offering the button rather than rendering a dispatched layout.
  const active = request !== null && toBackupStage(request) !== "cancelled" ? request : null;

  const stage = active ? toBackupStage(active) : null;
  const requestedAt = parseApiDate(active?.requested_at);
  const dispatchedAt = parseApiDate(active?.dispatched_at);
  const arrivedAt = parseApiDate(active?.arrived_at);

  // Only tick while a stage is genuinely still running.
  const isRunning = stage === "pending" || stage === "dispatched";
  const now = useServerTick(isRunning);

  // Poll for the transitions — elapsed time is local maths, but "command
  // dispatched Unit 02" only arrives when we ask.
  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(reload, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isRunning, reload]);

  /**
   * Runs a state-changing call and adopts the record it returns.
   *
   * Both endpoints answer with the updated request, so the panel reflects the
   * new stage immediately rather than waiting on a re-read that may not have
   * caught up. The reload afterwards is confirmation, not the source.
   */
  const runAction = async (
    action: () => Promise<BackupRequestResponse>,
    failure: string,
    setBusy: (busy: boolean) => void,
  ) => {
    setError("");
    setBusy(true);

    try {
      const updated = await action();
      if (updated && typeof updated.id === "number") setRequest(updated);
      reload();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : failure);
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    if (!active) return;
    runAction(
      () => cancelBackupRequest(incidentId, active.id),
      "Could not cancel the request.",
      setIsCancelling,
    );
  };

  const handleArrived = () => {
    if (!active) return;
    runAction(
      () => updateBackupStatus(incidentId, active.id, BACKUP_ARRIVED_STATUS),
      "Could not mark backup as arrived.",
      setIsMarkingArrived,
    );
  };

  const handleRequest = async () => {
    setIsConfirming(false);
    setError("");
    setIsRequesting(true);

    try {
      await requestBackup(incidentId);
      // The POST's response shape isn't in the spec, so the record is read
      // back from the history endpoint rather than assumed.
      reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not request backup.");
    } finally {
      setIsRequesting(false);
    }
  };

  /* Every duration below is `end ?? now` minus `start` — the same expression
     serves the live and the settled reading, so nothing has to be stopped.
     Once a stage is over its endpoint exists and the value freezes itself.
     `arrivedAt ?? null` rather than `?? now` after arrival, so a missing
     `arrived_at` shows "--:--" instead of a number that ticks forever. */
  const arrivedEnd = stage === "arrived" ? arrivedAt : now;

  const waitSeconds = secondsBetween(requestedAt, dispatchedAt ?? now);
  const travelSeconds = secondsBetween(dispatchedAt, arrivedEnd);
  const totalSeconds = secondsBetween(requestedAt, arrivedEnd);

  // The server's own figure wins once it exists — it can't drift.
  const responseTime =
    active?.response_time_formatted ||
    formatDuration(active?.response_time_seconds ?? waitSeconds);

  const eta =
    active?.eta_formatted ||
    (typeof active?.eta_minutes === "number" ? `${active.eta_minutes} mins` : null);

  if (isLoading) {
    return (
      <div className="backup-panel">
        <h3 className="backup-panel__title">Standard Backup Request</h3>
        <p className="backup-panel__text">Checking backup status...</p>
      </div>
    );
  }

  if (active === null) {
    return (
      <>
        <div className="backup-panel">
          <h3 className="backup-panel__title">Standard Backup Request</h3>
          <p className="backup-panel__text">
            Notifies command to dispatch nearby units visible on the radar.
          </p>

          {error && (
            <div className="auth-status auth-status--error backup-panel__error" role="alert">
              {error}
            </div>
          )}

          <button
            type="button"
            className="backup-panel__button"
            onClick={() => setIsConfirming(true)}
            disabled={isRequesting}
          >
            {isRequesting ? "Requesting..." : "Request Backup"}
          </button>
        </div>

        {isConfirming && (
          <ConfirmBackupModal
            onCancel={() => setIsConfirming(false)}
            onConfirm={handleRequest}
            isSubmitting={isRequesting}
          />
        )}
      </>
    );
  }

  if (stage === "pending") {
    return (
      <div className="backup-panel backup-panel--awaiting">
        <h3 className="backup-panel__title">Standard Backup Request</h3>

        <div className="backup-status">
          <p className="backup-status__label">Awaiting Command Response...</p>
          <p className="backup-status__clock backup-status__clock--waiting">
            {formatDuration(waitSeconds)}
          </p>

          {error && (
            <div className="auth-status auth-status--error backup-panel__error" role="alert">
              {error}
            </div>
          )}

          <button
            type="button"
            className="btn btn--outline backup-status__cancel"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Cancel request"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="backup-panel backup-panel--dispatched">
      <h3 className="backup-panel__title">Standard Backup Request</h3>

      <div className="backup-status">
        <div className="backup-fact">
          <span className="backup-fact__label">Command Centre Dispatched</span>
          <span className="backup-fact__value">
            {active.backup_unit_callsign ?? "Unit assigned"}
          </span>
        </div>

        <div className="backup-fact">
          <span className="backup-fact__label">Command Response Time</span>
          <span className="backup-fact__value">{responseTime}</span>
        </div>

        {eta && (
          <div className="backup-fact">
            <span className="backup-fact__label">
              Estimated Time of Arrival for &ldquo;{active.backup_unit_callsign ?? "backup"}&rdquo;
            </span>
            <span className="backup-fact__value">{eta}</span>
          </div>
        )}

        {stage === "dispatched" ? (
          <>
            <div className="backup-clock-card">
              <p className="backup-status__clock backup-status__clock--live">
                {formatDuration(travelSeconds)}
              </p>
              <p className="backup-clock-card__caption">Live travel tracking..</p>
            </div>

            {/* The requesting unit is on scene, so it is the one that sees
                backup turn up — nothing else can close this stage. */}
            <button
              type="button"
              className="btn btn--success backup-status__arrived"
              onClick={handleArrived}
              disabled={isMarkingArrived}
            >
              {isMarkingArrived ? "Updating..." : "Backup arrived on scene"}
            </button>
          </>
        ) : (
          <div className="backup-clock-card backup-clock-card--total">
            <span className="backup-clock-card__caption">Total time</span>
            <span className="backup-status__clock backup-status__clock--live">
              {formatDuration(totalSeconds)}
            </span>
          </div>
        )}

        {/* `arrived_at` is not on the response yet, so there is no instant to
            measure the total against. Says so rather than showing a wrong
            number; delete this once the field ships. */}
        {stage === "arrived" && totalSeconds === null && (
          <p className="backup-status__hint">
            Backup arrived. Total time needs an arrival timestamp from the API.
          </p>
        )}
      </div>
    </div>
  );
}
