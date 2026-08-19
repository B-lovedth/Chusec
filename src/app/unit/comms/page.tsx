"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { ListState } from "@/components/ui/ListState";
import { getUnitDashboard } from "@/services/dashboard.service";
import { listUnitMessages, sendUnitMessage } from "@/services/unit-messages.service";
import type { UnitMessageResponse } from "@/services/types";

/** Traffic is polled; the API exposes no socket or stream. */
const POLL_INTERVAL_MS = 15_000;

function formatStamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

export default function UnitCommsPage() {
  const [messages, setMessages] = useState<UnitMessageResponse[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [nonce, setNonce] = useState(0);

  /** Who this device signs as — the callsign is what the mesh recognises. */
  const [identity, setIdentity] = useState<{ name: string; role: string; area: string | null }>({
    name: "",
    role: "Field unit",
    area: null,
  });

  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    getUnitDashboard()
      .then((dashboard) => {
        if (cancelled) return;
        setIdentity({
          name: dashboard.callsign ?? dashboard.unit_name,
          role: dashboard.agency ?? "Field unit",
          area: dashboard.unit_name,
        });
      })
      .catch(() => {
        // Identity is a nicety — traffic still loads without it.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const poll = () => {
      listUnitMessages()
        .then((response) => {
          if (cancelled) return;
          // Oldest first, so the newest sits at the bottom of the thread.
          setMessages(
            [...response].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            ),
          );
          setStatus("ready");
        })
        .catch((pollError: unknown) => {
          if (cancelled) return;
          setError(pollError instanceof Error ? pollError.message : "Could not load mesh traffic.");
          setStatus("error");
        });
    };

    poll();
    const timer = window.setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  // Pin to the newest message whenever the thread grows.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();

    const message = draft.trim();
    if (!message || isSending) return;

    setSendError("");
    setIsSending(true);

    try {
      await sendUnitMessage({
        sender_name: identity.name || "Unassigned unit",
        sender_role: identity.role,
        message,
        area: identity.area,
      });
      setDraft("");
      reload();
    } catch (postError) {
      setSendError(postError instanceof Error ? postError.message : "Message did not send.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="page-card page-card--no-tabbar">
      <h1 className="command-title">Mesh Comms</h1>

      <section className="command-panel comms">
        <div className="command-panel__head">
          <h2>Open channel</h2>
          <span className="comms__identity">
            {identity.name ? `Signing as ${identity.name}` : "Identifying unit..."}
          </span>
        </div>

        {/* Every unit reads this board — worth saying so out loud. */}
        <p className="comms__notice">
          Broadcast to every unit on the mesh. There is no private thread here.
        </p>

        <div className="comms__list" ref={listRef}>
          <ListState
            status={status}
            error={error}
            isEmpty={messages.length === 0}
            emptyMessage="No traffic on the mesh yet."
            skeletonRows={4}
          >
            {messages.map((entry) => {
              const isOwn = Boolean(identity.name) && entry.sender_name === identity.name;

              return (
                <article className={isOwn ? "comms-msg is-own" : "comms-msg"} key={entry.id}>
                  <header className="comms-msg__head">
                    <span className="comms-msg__sender">{entry.sender_name}</span>
                    <span className="comms-msg__role">{entry.sender_role}</span>
                    <time className="comms-msg__time" dateTime={entry.created_at}>
                      {formatStamp(entry.created_at)}
                    </time>
                  </header>
                  <p className="comms-msg__body">{entry.message}</p>
                </article>
              );
            })}
          </ListState>
        </div>

        {sendError && (
          <div className="auth-status auth-status--error comms__error" role="alert">
            {sendError}
          </div>
        )}

        <form className="comms__composer" onSubmit={send}>
          <label className="sr-only" htmlFor="comms-draft">
            Message
          </label>
          <textarea
            id="comms-draft"
            className="comms__input"
            rows={2}
            value={draft}
            placeholder="Send to all units on the mesh..."
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button
            type="submit"
            className="btn btn--primary comms__send"
            disabled={isSending || draft.trim().length === 0}
          >
            <SendHorizontal size={16} strokeWidth={1.9} />
            <span>{isSending ? "Sending..." : "Send"}</span>
          </button>
        </form>
      </section>
    </main>
  );
}
