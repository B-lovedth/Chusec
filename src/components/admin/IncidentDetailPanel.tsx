"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Download, Eye, Film, ShieldCheck, UserRound } from "lucide-react";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { nearestForces, type Agency, type CommandIncident } from "@/data/admin";
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

type IncidentDetailPanelProps = {
  incident: CommandIncident;
};

export function IncidentDetailPanel({ incident }: IncidentDetailPanelProps) {
  const [tab, setTab] = useState<"detail" | "broadcast">("detail");
  const [status, setStatus] = useState<Severity>(incident.severity);
  const [statusOpen, setStatusOpen] = useState(true);
  const [alerted, setAlerted] = useState<string[]>([]);
  const [broadcast, setBroadcast] = useState("");

  const hasAlerted = alerted.length > 0;

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
                      onClick={() => setStatus(option)}
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

            <button
              type="button"
              className={hasAlerted ? "resolve-button is-ready" : "resolve-button"}
              disabled={!hasAlerted}
              title={hasAlerted ? undefined : "Alert a force before resolving"}
            >
              <ShieldCheck size={19} strokeWidth={2} />
              Resolved
            </button>
          </div>

          <div className="detail-body">
            <p className="forces-label">Nearest Forces</p>

            {nearestForces.map((force) => (
              <article className="force-card" key={force.id}>
                <AgencyBadge agency={force.agency} />
                <h3 className="force-card__station">{force.station}</h3>
                <p className="force-card__address">
                  {force.address} · {force.distance}
                </p>

                <div className="force-card__foot">
                  <span className="force-card__contact">
                    <UserRound size={15} strokeWidth={1.8} />
                    {force.contact}
                  </span>
                  <button
                    type="button"
                    className="alert-force-button"
                    onClick={() => setAlerted((current) => [...new Set([...current, force.id])])}
                  >
                    {alerted.includes(force.id) ? "Alerted" : "Alert"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="detail-body">
          <form
            className="broadcast-form"
            onSubmit={(event) => {
              event.preventDefault();
              setBroadcast("");
            }}
          >
            <div>
              <p className="detail-section-label" style={{ marginTop: 0 }}>
                Message to citizens in this polygon
              </p>
              <textarea
                value={broadcast}
                onChange={(event) => setBroadcast(event.target.value)}
                placeholder="Avoid the Warri-Sapele Road corridor. Security operatives are responding."
              />
            </div>

            <button type="submit" className="btn btn--primary" disabled={!broadcast.trim()}>
              Send broadcast
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
