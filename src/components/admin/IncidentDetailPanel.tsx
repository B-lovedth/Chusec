"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Download, Eye, Film, ShieldCheck, UserRound } from "lucide-react";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { ListState } from "@/components/ui/ListState";
import { useApiList } from "@/hooks/useApiList";
import { loadSecurityUnits } from "@/data/loaders";
import {
  broadcastIncident,
  dispatchUnit,
  resolveIncident,
  updateIncidentSeverity,
} from "@/services/incidents.service";
import type { Agency, CommandIncident } from "@/data/admin";
import type { Severity } from "@/data/dashboard";

const statuses: Severity[] = ["Critical", "Medium", "High", "Low"];

const agencyModifier: Record<Agency, string> = {
  "Nigeria Police Force": "police",
  DSS: "dss",
  NSCDC: "nscdc",
  Immigration: "immigration",
  "Nigeria Custom": "custom",
  "Correctional Service": "correctional",
  NDLEA: "ndlea",
  FRSC: "frsc",
};

export function AgencyBadge({ agency }: { agency: Agency }) {
  return <span className={`agency-badge agency-badge--${agencyModifier[agency]}`}>{agency}</span>;
}

/** The API accepts a 2km-50km radius. */
const BROADCAST_RANGES = [2, 5, 10, 20, 30, 50];

const BROADCAST_TEMPLATES = [
  'ALERT: Active threat on Warri-Asaba corridor. Avoid travel.',
  'WARNING: Fake checkpoint near Asaba. Do not stop.',
  'UPDATE: Situation resolved. Normal traffic may resume.',
];

type IncidentDetailPanelProps = {
  incident: CommandIncident;
  onResolved?: () => void;
};

export function IncidentDetailPanel({ incident, onResolved }: IncidentDetailPanelProps) {
  const [tab, setTab] = useState<"detail" | "broadcast">("detail");
  const [status, setStatus] = useState<Severity>(incident.severity);
  const [statusOpen, setStatusOpen] = useState(true);
  const [isGrading, setIsGrading] = useState(false);

  const { status: unitsStatus, items: units, error: unitsError } = useApiList(loadSecurityUnits);

  const [dispatched, setDispatched] = useState<string[]>([]);
  const [pendingUnit, setPendingUnit] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastNote, setBroadcastNote] = useState("");
  const [broadcastResult, setBroadcastResult] = useState("");
  const [rangeKm, setRangeKm] = useState(2);

  const incidentId = Number(incident.id);
  const hasDispatched = dispatched.length > 0;

  /** Persists the grade — the dropdown used to change local state only. */
  const handleSeverity = async (next: Severity) => {
    if (next === status) return;

    const previous = status;
    setStatus(next);
    setActionError("");
    setIsGrading(true);

    try {
      await updateIncidentSeverity(incidentId, next);
    } catch (error) {
      // Put the badge back so it never claims a grade the server rejected.
      setStatus(previous);
      setActionError(error instanceof Error ? error.message : "Could not update the severity.");
    } finally {
      setIsGrading(false);
    }
  };

  const handleDispatch = async (unitName: string) => {
    setActionError("");
    setPendingUnit(unitName);

    try {
      await dispatchUnit(incidentId, unitName);
      setDispatched((current) => [...new Set([...current, unitName])]);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not alert that unit.");
    } finally {
      setPendingUnit(null);
    }
  };

  const handleResolve = async () => {
    setActionError("");
    setIsResolving(true);

    try {
      await resolveIncident(incidentId, true);
      onResolved?.();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not resolve this incident.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleBroadcast = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError("");
    setBroadcastResult("");
    setIsBroadcasting(true);

    try {
      await broadcastIncident(incidentId, rangeKm);
      setBroadcastResult(`Broadcast sent to citizens within ${rangeKm} km.`);
      setBroadcastNote("");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not send the broadcast.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <section className="detail-panel">
      <div className="detail-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "detail"}
          className={tab === "detail" ? "is-active" : undefined}
          onClick={() => setTab("detail")}
        >
          Detail
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "broadcast"}
          className={tab === "broadcast" ? "is-active" : undefined}
          onClick={() => setTab("broadcast")}
        >
          Broadcast
        </button>
      </div>

      {tab === "detail" ? (
        <>
          <div className="detail-body">
            <div className="detail-posted">
              <span>Posted by : {incident.reportedBy}</span>
            </div>

            <p className="detail-ref">
              {incident.reference} · {incident.time}
            </p>
            <h2 className="detail-heading">{incident.title}</h2>
            <p className="detail-location">{incident.location}</p>
            <p className="detail-narrative">{incident.narrative}</p>

            {incident.evidence.length > 0 && (
              <>
                <p className="detail-section-label">Evidence</p>
                {incident.evidence.map((file) => (
                  <div className="evidence-row" key={file.name}>
                    <span className="evidence-row__thumb" aria-hidden="true">
                      <Film size={16} strokeWidth={1.8} />
                    </span>
                    <span className="evidence-row__name">{file.name}</span>
                    <span className="evidence-row__actions">
                      <button type="button" aria-label={`Preview ${file.name}`}>
                        <Eye size={16} strokeWidth={1.8} />
                      </button>
                      <button type="button" aria-label={`Download ${file.name}`}>
                        <Download size={16} strokeWidth={1.8} />
                      </button>
                    </span>
                  </div>
                ))}
              </>
            )}

            <p className="detail-section-label">Status</p>
            <div className="status-select">
              <button
                type="button"
                className="status-select__trigger"
                onClick={() => setStatusOpen((open) => !open)}
                aria-expanded={statusOpen}
              >
                <SeverityBadge severity={status} />
                {statusOpen ? (
                  <ChevronUp size={17} strokeWidth={1.9} />
                ) : (
                  <ChevronDown size={17} strokeWidth={1.9} />
                )}
              </button>

              {statusOpen && (
                <div className="status-select__options" role="listbox">
                  {statuses.map((option) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected={option === status}
                      className="status-select__option"
                      key={option}
                      onClick={() => handleSeverity(option)}
                      disabled={isGrading}
                    >
                      <SeverityBadge severity={option} />
                      {option === status && (
                        <span className="status-select__check" aria-hidden="true">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {actionError && (
              <div className="auth-status auth-status--error detail-action-error" role="alert">
                {actionError}
              </div>
            )}

            <button
              type="button"
              className={hasDispatched ? "resolve-button is-ready" : "resolve-button"}
              disabled={!hasDispatched || isResolving}
              onClick={handleResolve}
              title={hasDispatched ? undefined : "Alert a unit before resolving"}
            >
              <ShieldCheck size={19} strokeWidth={2} />
              {isResolving ? "Resolving..." : "Resolved"}
            </button>
          </div>

          <div className="detail-body">
            <p className="forces-label">Nearest Forces</p>

            <ListState
              status={unitsStatus}
              error={unitsError}
              isEmpty={units.length === 0}
              emptyMessage="No units are registered yet."
              skeletonRows={2}
            >
              {units.slice(0, 5).map((unit) => (
                <article className="force-card" key={unit.id}>
                  <AgencyBadge agency={unit.agency} />
                  <h3 className="force-card__station">{unit.name}</h3>
                  <p className="force-card__address">
                    {unit.address}
                    {unit.lga ? ` · ${unit.lga}` : ""}
                  </p>

                  <div className="force-card__foot">
                    <span className="force-card__contact">
                      <UserRound size={15} strokeWidth={1.8} />
                      {unit.teamLead}
                    </span>
                    <button
                      type="button"
                      className="alert-force-button"
                      onClick={() => handleDispatch(unit.respondingUnit || unit.name)}
                      disabled={pendingUnit !== null}
                    >
                      {dispatched.includes(unit.respondingUnit || unit.name)
                        ? "Alerted"
                        : pendingUnit === (unit.respondingUnit || unit.name)
                          ? "Alerting..."
                          : "Alert"}
                    </button>
                  </div>
                </article>
              ))}
            </ListState>
          </div>
        </>
      ) : (
        <div className="detail-body">
          <form className="broadcast-form" onSubmit={handleBroadcast}>
            <p className="broadcast-form__label">Broadcast to Public</p>

            <div className="broadcast-templates">
              {BROADCAST_TEMPLATES.map((template) => (
                <button
                  type="button"
                  key={template}
                  className={broadcastNote === template ? "broadcast-template is-active" : "broadcast-template"}
                  onClick={() => setBroadcastNote(template)}
                >
                  {template}
                </button>
              ))}
            </div>

            <label className="field">
              <span className="broadcast-form__label">Distance</span>
              <span className="control">
                <select
                  className="control__select"
                  value={rangeKm}
                  onChange={(event) => setRangeKm(Number(event.target.value))}
                  disabled={isBroadcasting}
                  aria-label="Broadcast radius"
                >
                  {BROADCAST_RANGES.map((range) => (
                    <option key={range} value={range}>
                      {range}km
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <label className="field">
              <span className="broadcast-form__label">Description</span>
              <textarea
                value={broadcastNote}
                onChange={(event) => setBroadcastNote(event.target.value)}
                placeholder="Compose custom alert..."
                disabled={isBroadcasting}
              />
            </label>

            {actionError && (
              <div className="auth-status auth-status--error" role="alert">
                {actionError}
              </div>
            )}

            {broadcastResult && (
              <div className="auth-status auth-status--success" role="status">
                {broadcastResult}
              </div>
            )}

            <button type="submit" className="btn btn--primary broadcast-send" disabled={isBroadcasting}>
              {isBroadcasting ? "Sending..." : "Broadcast push alert"}
            </button>

            <p className="broadcast-hint">
              The API broadcasts by radius only — the message text isn&apos;t sent with it yet.
            </p>
          </form>
        </div>
      )}
    </section>
  );
}
