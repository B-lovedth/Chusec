"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { IncidentClearanceReport } from "@/services/types";

const counts: { key: keyof IncidentClearanceReport; label: string }[] = [
  { key: "victims_injured", label: "Victims injured" },
  { key: "victims_dead", label: "Victims dead" },
  { key: "criminals_injured", label: "Criminals injured" },
  { key: "criminals_dead", label: "Criminals dead" },
  { key: "criminals_arrested", label: "Criminals arrested" },
  { key: "agents_injured", label: "Agents injured" },
  { key: "agents_dead", label: "Agents dead" },
];

type ClearIncidentModalProps = {
  reference: string;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (report: IncidentClearanceReport) => void;
};

export function ClearIncidentModal({
  reference,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ClearIncidentModalProps) {
  const [report, setReport] = useState<IncidentClearanceReport>({
    victims_injured: 0,
    victims_dead: 0,
    criminals_injured: 0,
    criminals_dead: 0,
    criminals_arrested: 0,
    agents_injured: 0,
    agents_dead: 0,
    clearance_notes: "",
    successful: true,
  });

  return (
    <div
      className="choice-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-incident-heading"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="clearance-modal">
        <button
          type="button"
          className="choice-modal__close"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close"
        >
          <X size={16} strokeWidth={2} />
        </button>

        <h2 className="confirm-modal__title" id="clear-incident-heading">
          Clearance report · {reference}
        </h2>
        <p className="confirm-modal__text">
          Recorded against the incident when it closes. Leave counts at zero where they don&apos;t apply.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(report);
          }}
        >
          <div className="clearance-grid">
            {counts.map((field) => (
              <label className="field" key={field.key}>
                <span className="field__label">{field.label}</span>
                <span className="control">
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={String(report[field.key] ?? 0)}
                    onChange={(event) =>
                      setReport((current) => ({
                        ...current,
                        [field.key]: Math.max(0, Number(event.target.value) || 0),
                      }))
                    }
                    disabled={isSubmitting}
                  />
                </span>
              </label>
            ))}
          </div>

          <label className="field clearance-notes">
            <span className="field__label">Clearance notes</span>
            <textarea
              value={report.clearance_notes ?? ""}
              onChange={(event) =>
                setReport((current) => ({ ...current, clearance_notes: event.target.value }))
              }
              placeholder="What happened on scene?"
              disabled={isSubmitting}
            />
          </label>

          <label className="signup-terms clearance-successful">
            <span className="checkbox">
              <input
                type="checkbox"
                checked={report.successful ?? true}
                onChange={(event) =>
                  setReport((current) => ({ ...current, successful: event.target.checked }))
                }
                disabled={isSubmitting}
              />
              <span className="checkbox__box" aria-hidden="true">
                ✓
              </span>
            </span>
            <span>Operation was successful</span>
          </label>

          {error && (
            <div className="auth-status auth-status--error confirm-modal__error" role="alert">
              {error}
            </div>
          )}

          <div className="confirm-modal__actions">
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Clear incident"}
            </button>
            <button type="button" className="btn btn--outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
