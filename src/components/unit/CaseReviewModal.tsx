"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { IncidentOutcomeSummary } from "@/components/admin/IncidentOutcomeSummary";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import type { CommandIncident } from "@/data/admin";

type CaseReviewModalProps = {
  incident: CommandIncident;
  onClose: () => void;
};

/**
 * Read-only counterpart to `ClearIncidentModal`: the same report a unit filed
 * on closing a case, played back for review.
 */
export function CaseReviewModal({ incident, onClose }: CaseReviewModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="choice-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-review-heading"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="clearance-modal case-review">
        <button type="button" className="choice-modal__close" onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={2} />
        </button>

        <h2 className="confirm-modal__title" id="case-review-heading">
          {incident.reference}
        </h2>

        <div className="case-review__head">
          <h3 className="case-review__title">{incident.title}</h3>
          <SeverityBadge severity={incident.severity} />
        </div>

        <p className="case-review__location">
          {incident.location} · {incident.date} {incident.time}
        </p>

        <p className="case-review__label">
          {incident.description ? "Description" : "Summary"}
        </p>
        <p className="case-review__text">{incident.narrative}</p>

        <p className="case-review__label">Response timeline</p>
        <ol className="case-timeline">
          <li>
            <span>Reported</span>
            <span>{incident.unitTimeline.dispatched}</span>
          </li>
          <li>
            <span>En route</span>
            <span>{incident.unitTimeline.enRoute}</span>
          </li>
          <li>
            <span>On scene</span>
            <span>{incident.unitTimeline.onScene}</span>
          </li>
          <li>
            <span>Resolved</span>
            <span>{incident.unitTimeline.resolved}</span>
          </li>
        </ol>

        <p className="case-review__label">Casualty report</p>
        <IncidentOutcomeSummary outcome={incident.outcome} />

        <p className="case-review__label">Clearance notes</p>
        <p className="case-review__text">
          {incident.clearanceNotes ?? (
            <span className="case-review__muted">No notes were filed.</span>
          )}
        </p>

        <div className="confirm-modal__actions">
          <button type="button" className="btn btn--outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
