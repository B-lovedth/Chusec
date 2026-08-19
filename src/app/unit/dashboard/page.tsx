"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { CommandMap } from "@/components/admin/CommandMap";
import { IncidentQueue } from "@/components/admin/IncidentQueue";
import { ResponseProgress, type UnitStatus } from "@/components/unit/ResponseProgress";
import { ClearIncidentModal } from "@/components/unit/ClearIncidentModal";
import { BackupPanel } from "@/components/unit/BackupPanel";
import { getUnitDashboard } from "@/services/dashboard.service";
import { toAssignedIncident, toOwnUnitMarker, toUnitStatus } from "@/lib/admin-mappers";
import type { SecurityUnit } from "@/data/admin";
import type { UnitAssignedIncidentResponse } from "@/services/types";
import {
  clearIncident,
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

/** Renders a server timestamp for the progress stepper. */
function formatStamp(iso: string | null | undefined) {
  if (!iso) return undefined;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;

  return date.toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UnitDashboardPage() {
  const [assigned, setAssigned] = useState<UnitAssignedIncidentResponse[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [nonce, setNonce] = useState(0);
  const [portalTitle, setPortalTitle] = useState("Unit Portal");
  const [fieldUnits, setFieldUnits] = useState<SecurityUnit[]>([]);

  useEffect(() => {
    let cancelled = false;

    getUnitDashboard()
      .then((dashboard) => {
        if (cancelled) return;
        setAssigned([...dashboard.active_assigned_incidents, ...dashboard.resolved_incidents]);
        // Titles the portal by the unit's own agency instead of hardcoding "Police".
        setPortalTitle(dashboard.agency ? `${dashboard.agency} Portal` : "Unit Portal");

        // Only this unit's own position — the full roster is admin-only.
        const own = toOwnUnitMarker(dashboard);
        setFieldUnits(own ? [own] : []);

        setStatus("ready");
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setError(fetchError instanceof Error ? fetchError.message : "Could not load your cases.");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);
  const incidents = useMemo(() => assigned.map(toAssignedIncident), [assigned]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isAdvancing, setIsAdvancing] = useState(false);
  const [actionError, setActionError] = useState("");

  const [evidenceName, setEvidenceName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isClearing, setIsClearing] = useState(false);
  const [clearError, setClearError] = useState("");
  const [isSubmittingClearance, setIsSubmittingClearance] = useState(false);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setEvidenceName("");
    setActionError("");
  }, []);

  const selected = incidents.find((incident) => incident.id === selectedId) ?? incidents[0] ?? null;

  /**
   * Progress is read back off the incident record rather than tracked locally.
   * The old local state reset to "Dispatched" on every selection and every
   * refresh, so a unit already on scene looked like it had not moved.
   */
  const selectedRecord = assigned.find((record) => String(record.id) === selected?.id) ?? null;
  const unitStatus = toUnitStatus(selectedRecord?.unit_status);

  const timestamps: Partial<Record<UnitStatus, string>> = {
    dispatched: formatStamp(selectedRecord?.created_at),
    en_route: formatStamp(selectedRecord?.en_route_at),
    on_scene: formatStamp(selectedRecord?.arrived_at),
    resolved: formatStamp(selectedRecord?.resolved_at),
  };

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
      reload();
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
      setIsClearing(false);
      reload();
    } catch (error_) {
      setClearError(error_ instanceof Error ? error_.message : "Could not clear the incident.");
    } finally {
      setIsSubmittingClearance(false);
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
      <h1 className="command-title">{portalTitle} · Delta State</h1>

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
          <CommandMap
            incidents={incidents}
            selectedId={selected?.id ?? ""}
            onSelect={select}
            units={fieldUnits}
          />
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

              {/* Nothing to reinforce once the case is closed. */}
              {!selected.isResolved && unitStatus !== "resolved" && (
                <BackupPanel incidentId={Number(selected.id)} key={selected.id} />
              )}
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
