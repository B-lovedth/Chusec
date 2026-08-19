import type { BackupRequestResponse } from "@/services/types";

/** How far a backup request has got, as the UI thinks about it. */
export type BackupStage = "pending" | "dispatched" | "arrived" | "cancelled";

/**
 * The status the backend writes when backup reaches the scene. It is
 * `on_scene`, matching the unit-status vocabulary used elsewhere in the API —
 * not `arrived`, which is only what this stage is called here.
 */
export const BACKUP_ARRIVED_STATUS = "on_scene";

/** Every spelling seen on the wire, mapped onto one stage. */
const STATUS_TO_STAGE: Record<string, BackupStage> = {
  pending: "pending",
  requested: "pending",
  dispatched: "dispatched",
  en_route: "dispatched",
  on_scene: "arrived",
  arrived: "arrived",
  cancelled: "cancelled",
  canceled: "cancelled",
};

/**
 * Status is authoritative for *which* stage a request is in; timestamps only
 * measure how long each stage took. An unrecognised value falls back to what
 * the timestamps imply rather than stalling the UI on a stage it can't name.
 */
export function toBackupStage(request: BackupRequestResponse): BackupStage {
  const normalised = (request.status ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const match = STATUS_TO_STAGE[normalised];
  if (match) return match;

  if (request.arrived_at) return "arrived";
  return request.dispatched_at ? "dispatched" : "pending";
}

/**
 * The newest request that wasn't stood down. An arrived one still counts — its
 * total time is the last screen of the flow.
 *
 * Chosen by id rather than array position: the endpoint's ordering isn't
 * documented, and reading it the wrong way round surfaces a *stale* request,
 * which then looks like a clock that refuses to stop.
 */
export function pickLatestOpenBackup(
  history: BackupRequestResponse[],
): BackupRequestResponse | null {
  return history
    .filter((entry) => toBackupStage(entry) !== "cancelled")
    .reduce<BackupRequestResponse | null>(
      (latest, entry) => (latest === null || entry.id > latest.id ? entry : latest),
      null,
    );
}
