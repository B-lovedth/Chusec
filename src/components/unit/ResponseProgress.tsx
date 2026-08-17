"use client";

import { CircleCheck, Flag, Radio, Truck } from "lucide-react";

/**
 * `PATCH /api/incidents/{id}/unit-status` takes a free-form string. These are
 * the values the frontend sends — confirm them against the backend's accepted
 * set, since the schema does not declare an enum.
 */
export const UNIT_STATUSES = ["dispatched", "en_route", "on_scene", "resolved"] as const;

export type UnitStatus = (typeof UNIT_STATUSES)[number];

const steps: { status: UnitStatus; label: string; Icon: typeof Radio }[] = [
  { status: "dispatched", label: "Dispatched", Icon: Radio },
  { status: "en_route", label: "Started Routing", Icon: Truck },
  { status: "on_scene", label: "On Scene", Icon: Flag },
  { status: "resolved", label: "Resolved", Icon: CircleCheck },
];

type ResponseProgressProps = {
  reference: string;
  current: UnitStatus;
  /** ISO or display timestamps keyed by status, for the reached steps. */
  timestamps: Partial<Record<UnitStatus, string>>;
};

export function ResponseProgress({ reference, current, timestamps }: ResponseProgressProps) {
  const currentIndex = steps.findIndex((step) => step.status === current);

  return (
    <section className="chart-card">
      <h2 className="chart-card__title">Response Progress - {reference}</h2>

      <div className="chart-card__plot">
        <ol className="progress-track">
          {steps.map((step, index) => {
            const reached = index <= currentIndex;

            return (
              <li
                key={step.status}
                className={reached ? "progress-step is-reached" : "progress-step"}
              >
                <span className="progress-step__icon" aria-hidden="true">
                  <step.Icon size={19} strokeWidth={2} />
                </span>
                <span className="progress-step__label">{step.label}</span>
                {reached && timestamps[step.status] && (
                  <span className="progress-step__time">{timestamps[step.status]}</span>
                )}
                {index < steps.length - 1 && (
                  <span
                    className={index < currentIndex ? "progress-step__bar is-filled" : "progress-step__bar"}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
