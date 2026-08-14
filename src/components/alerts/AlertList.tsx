"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { safetyAlerts } from "@/data/alerts";

export function AlertList() {
  const [alerts, setAlerts] = useState(safetyAlerts);

  const markAsRead = (id: number) => {
    setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)));
  };

  return (
    <section className="panel alerts-panel">
      <div className="alert-list">
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
      </div>
    </section>
  );
}
