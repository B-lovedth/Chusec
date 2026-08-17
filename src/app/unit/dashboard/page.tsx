"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { CommandMap } from "@/components/admin/CommandMap";
import { IncidentQueue } from "@/components/admin/IncidentQueue";
import { ResponseProgress, type UnitStatus } from "@/components/unit/ResponseProgress";
import { ClearIncidentModal } from "@/components/unit/ClearIncidentModal";
import { useApiList } from "@/hooks/useApiList";
import { loadAssignedIncidents } from "@/data/loaders";
import {
  clearIncident,
  requestBackup,
  updateUnitStatus,
  uploadEvidence,
} from "@/services/incidents.service";
import type { IncidentClearanceReport } from "@/services/types";

/** What the primary button does at each point in the response. */
const nextStep: Record<UnitStatus, { label: string; status: UnitStatus; tone: string } | null> = {
  dispatched: { label: "Accept & Start Routing", status: "en_route", tone: "btn--primary" },
  en_route: { label: "Arrive On Scene", status: "on_scene", tone: "btn--primary" },
  on_scene: { label: "Resolved & Clear Incident", status: "resolved", tone: "btn--success" },
  resolved: null,
};

function nowLabel() {
  return new Date().toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UnitDashboardPage() {
  const { status, items: incidents, error } = useApiList(loadAssignedIncidents);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [unitStatus, setUnitStatus] = useState<UnitStatus>("dispatched");
  const [timestamps, setTimestamps] = useState<Partial<Record<UnitStatus, string>>>({});
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [actionError, setActionError] = useState("");

  const [evidenceName, setEvidenceName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [backupRequested, setBackupRequested] = useState(false);
  const [isRequestingBackup, setIsRequestingBackup] = useState(false);

  const [isClearing, setIsClearing] = useState(false);
  const [clearError, setClearError] = useState("");
  const [isSubmittingClearance, setIsSubmittingClearance] = useState(false);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    // Each case tracks its own progress; reset when switching.
    setUnitStatus("dispatched");
    setTimestamps({});
    setBackupRequested(false);
    setEvidenceName("");
    setActionError("");
  }, []);

  const selected = incidents.find((incident) => incident.id === selectedId) ?? incidents[0] ?? null;
  const step = nextStep[unitStatus];

  const advance = async () => {
    if (!selected || !step) return;

    // The last step opens the clearance report instead of posting a status.
    if (step.status === "resolved") {
      setClearError("");
      setIsClearing(true);
      return;
    }

    setActionError("");
    setIsAdvancing(true);

    try {
      await updateUnitStatus(Number(selected.id), step.status);
      setUnitStatus(step.status);
      setTimestamps((current) => ({ ...current, [step.status]: nowLabel() }));
    } catch (advanceError) {
      setActionError(
        advanceError instanceof Error ? advanceError.message : "Could not update the response status.",
      );
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleClearance = async (report: IncidentClearanceReport) => {
    if (!selected) return;

    setClearError("");
    setIsSubmittingClearance(true);

    try {
      await clearIncident(Number(selected.id), report);
      setUnitStatus("resolved");
      setTimestamps((current) => ({ ...current, resolved: nowLabel() }));
      setIsClearing(false);
    } catch (error_) {
      setClearError(error_ instanceof Error ? error_.message : "Could not clear the incident.");
    } finally {
      setIsSubmittingClearance(false);
    }
  };

  const handleBackup = async () => {
    if (!selected) return;

    setActionError("");
    setIsRequestingBackup(true);

    try {
      await requestBackup(Number(selected.id));
      setBackupRequested(true);
    } catch (backupError) {
      setActionError(
        backupError instanceof Error ? backupError.message : "Could not request backup.",
      );
    } finally {
      setIsRequestingBackup(false);
    }
  };

  const handleEvidence = async (file: File | undefined) => {
    if (!file || !selected) return;

    setActionError("");

    try {
      await uploadEvidence(file, selected.id);
      setEvidenceName(file.name);
    } catch (uploadError) {
      setActionError(uploadError instanceof Error ? uploadError.message : "Could not upload evidence.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <main className="page-card page-card--no-tabbar">
      <h1 className="command-title">Police Unit Portal · Delta State</h1>

      <div className="command-grid">
        <IncidentQueue
          incidents={incidents}
          selectedId={selected?.id ?? ""}
          onSelect={select}
          status={status}
          error={error}
          title="Assigned Cases"
        />

        <div>
          <CommandMap incidents={incidents} selectedId={selected?.id ?? ""} onSelect={select} />
          {selected && (
            <ResponseProgress
              reference={selected.reference}
              current={unitStatus}
              timestamps={timestamps}
            />
          )}
        </div>

        <div className="detail-panel">
          <div className="detail-tabs detail-tabs--single">
            <span className="is-active">Active Incident Summary</span>
          </div>

          {selected ? (
            <>
              <div className="detail-body">
                <p className="detail-ref">
                  {selected.reference} · {selected.time}
                </p>
                <h2 className="detail-heading">{selected.title}</h2>
                <p className="detail-location">{selected.location}</p>
                <p className="detail-narrative">{selected.narrative}</p>

                {actionError && (
                  <div className="auth-status auth-status--error detail-action-error" role="alert">
                    {actionError}
                  </div>
                )}

                {step ? (
                  <button
                    type="button"
                    className={`btn ${step.tone} unit-primary-action`}
                    onClick={advance}
                    disabled={isAdvancing}
                  >
                    {isAdvancing ? "Updating..." : step.label}
                  </button>
                ) : (
                  <p className="unit-resolved-note">This incident has been cleared.</p>
                )}

                <p className="detail-section-label">Secure Evidence Upload</p>
                <div className="evidence-actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={15} strokeWidth={1.9} />
                    Upload File
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={15} strokeWidth={1.9} />
                    Take Photo
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="sr-only"
                  onChange={(event) => handleEvidence(event.target.files?.[0])}
                />
                <p className="evidence-empty">
                  {evidenceName ? `Uploaded: ${evidenceName}` : "No evidence uploaded yet."}
                </p>
              </div>

              <div className="backup-panel">
                <h3 className="backup-panel__title">Standard Backup Request</h3>
                <p className="backup-panel__text">
                  Notifies command to dispatch nearby units visible on the radar.
                </p>
                <button
                  type="button"
                  className="backup-panel__button"
                  onClick={handleBackup}
                  disabled={isRequestingBackup || backupRequested}
                >
                  {backupRequested
                    ? "Backup Requested"
                    : isRequestingBackup
                      ? "Requesting..."
                      : "Request Backup"}
                </button>
              </div>
            </>
          ) : (
            <div className="detail-body">
              <p className="list-message">
                {status === "loading" ? "Loading assigned cases..." : "No cases assigned to you."}
              </p>
            </div>
          )}
        </div>
      </div>

      {isClearing && selected && (
        <ClearIncidentModal
          reference={selected.reference}
          isSubmitting={isSubmittingClearance}
          error={clearError}
          onClose={() => setIsClearing(false)}
          onSubmit={handleClearance}
        />
      )}
    </main>
  );
}
