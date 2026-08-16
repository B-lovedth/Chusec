"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { useApiList } from "@/hooks/useApiList";
import { loadSafetyAlerts } from "@/data/loaders";
import { ListState } from "@/components/ui/ListState";

export function AlertList() {
  const { status, items, error } = useApiList(loadSafetyAlerts);
  // Only the read overrides live in state; the list itself stays derived, so a
  // refreshed fetch never has to be copied across.
  const [readIds, setReadIds] = useState<number[]>([]);

  const alerts = items.map((alert) =>
    readIds.includes(alert.id) ? { ...alert, read: true } : alert,
  );

  const markAsRead = (id: number) => {
    // Read state is local only — the API has no alerts resource yet.
    setReadIds((current) => [...current, id]);
  };

  return (
    <section className="panel alerts-panel">
      <div className="alert-list">
        <ListState
          status={status}
          error={error}
          isEmpty={alerts.length === 0}
          emptyMessage="No alerts for your area right now."
          skeletonRows={4}
        >
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className={alert.read ? "alert-card is-read" : "alert-card"}
              data-tone={alert.tone}
            >
              <div className="alert-card__head">
                <h2 className="alert-card__title">{alert.location}</h2>
                <time className="alert-card__time">{alert.time}</time>
              </div>

              <p className="alert-card__message">{alert.message}</p>

              {!alert.read && (
                <button type="button" className="alert-card__action" onClick={() => markAsRead(alert.id)}>
                  <CircleCheck size={13} strokeWidth={2} />
                  Mark as Read
                </button>
              )}
            </article>
          ))}
        </ListState>
      </div>
    </section>
  );
}
