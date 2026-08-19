"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notifications.service";
import type { NotificationResponse } from "@/services/types";

/** Notifications are polled; there is no push channel wired up yet. */
const POLL_INTERVAL_MS = 60_000;

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.round(hours / 24)}d ago`;
}

export function NotificationBell() {
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [unread, setUnread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const poll = () => {
      listNotifications()
        .then((response) => {
          if (cancelled) return;
          setItems(response.notifications ?? []);
          setUnread(response.unread_count ?? 0);
        })
        .catch(() => {
          // A failed poll never breaks the shell — keep the last good state.
        });
    };

    poll();
    const timer = window.setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [nonce]);

  /** Re-pulls the list when an optimistic write turns out to have failed. */
  const reload = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  /**
   * Clicking only marks the item read. The API's `link` field points at routes
   * this app does not have, so following it just 404s — revisit once the
   * backend and the frontend agree on those paths.
   */
  const openOne = async (notification: NotificationResponse) => {
    if (notification.is_read) return;

    setItems((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item)),
    );
    setUnread((current) => Math.max(0, current - 1));

    await markNotificationRead(notification.id).catch(reload);
  };

  const readAll = async () => {
    setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    setUnread(0);
    await markAllNotificationsRead().catch(reload);
  };

  return (
    <div className="topbar__notifications" ref={panelRef}>
      <button
        type="button"
        className="topbar__bell"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Bell size={20} strokeWidth={1.9} />
        {/* Only shown when something is genuinely unread. */}
        {unread > 0 && (
          <span className="topbar__bell__count" aria-hidden="true">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel" role="menu">
          <div className="notification-panel__head">
            <h2>Notifications</h2>
            {unread > 0 && (
              <button type="button" onClick={readAll}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-panel__list">
            {items.length === 0 ? (
              <p className="notification-panel__empty">Nothing yet.</p>
            ) : (
              items.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  className={
                    notification.is_read ? "notification-item" : "notification-item is-unread"
                  }
                  onClick={() => openOne(notification)}
                >
                  <span className="notification-item__title">{notification.title}</span>
                  <span className="notification-item__message">{notification.message}</span>
                  <span className="notification-item__time">{relativeTime(notification.created_at)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
