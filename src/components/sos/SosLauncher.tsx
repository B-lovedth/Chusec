"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, MapPin, Mic, X } from "lucide-react";
import { sosRecipients } from "@/data/sos";
import { useDraggable } from "@/hooks/useDraggable";
import {
  cancelSos,
  cancelSosWithAudio,
  triggerSos,
  uploadDuressAudio,
} from "@/services/sos.service";
import { startDuressRecording, type DuressRecording } from "@/lib/duress-audio";
import { getCurrentCoordinates, toApiPoint } from "@/lib/geolocation";
import type { SOSResponse } from "@/services/types";

const HOLD_TO_CANCEL_MS = 2000;

/** Used only when the server asks for a recording but names no deadline. */
const FALLBACK_RECORDING_MS = 30_000;

/**
 * The server decides whether ambient audio is captured, via
 * `duress_recording_status` / `duress_recording_until` on the SOS response.
 * Returns the epoch ms to record until, or null to record nothing.
 */
function recordingDeadline(sos: SOSResponse): number | null {
  const status = (sos.duress_recording_status ?? "none").trim().toLowerCase();
  if (status === "none" || status === "" || status === "uploaded") return null;

  const until = sos.duress_recording_until ? new Date(sos.duress_recording_until).getTime() : NaN;
  if (Number.isNaN(until)) return Date.now() + FALLBACK_RECORDING_MS;

  return until;
}

export function SosLauncher() {
  const [isActive, setIsActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [dispatchError, setDispatchError] = useState("");
  const [isLocationLive, setIsLocationLive] = useState(false);
  const [sosId, setSosId] = useState<number | null>(null);
  const [recordingUntil, setRecordingUntil] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const frameRef = useRef<number | null>(null);
  const recorderRef = useRef<DuressRecording | null>(null);
  const {
    ref: fabRef,
    position: fabPosition,
    isDragging,
    consumeDrag,
    handlers: dragHandlers,
  } = useDraggable<HTMLButtonElement>();

  const stopHold = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    setHoldProgress(0);
  }, []);

  /**
   * Cancelling stands the alert down on the backend too — the old version only
   * reset local state, which left the SOS open for command indefinitely.
   * Anything captured so far rides along, since a cancellation made under
   * coercion is exactly what the duress clip exists to record.
   */
  const deactivate = useCallback(() => {
    stopHold();

    const id = sosId;
    const recording = recorderRef.current;
    recorderRef.current = null;
    setRecordingUntil(null);

    if (id === null) {
      setIsActive(false);
      setIsOpen(false);
      return;
    }

    setIsCancelling(true);
    setDispatchError("");

    const request = recording
      ? recording.stop().then((file) =>
          file
            ? cancelSosWithAudio(id, file)
            : cancelSos(id, { cancellation_reason: "Cancelled by user" }),
        )
      : cancelSos(id, { cancellation_reason: "Cancelled by user" });

    request
      .then(() => {
        setSosId(null);
        setIsActive(false);
        setIsOpen(false);
      })
      .catch((error: unknown) => {
        // The alert is still live, so the UI must keep saying so.
        setDispatchError(
          error instanceof Error
            ? `${error.message} — the SOS is still active.`
            : "Could not cancel. The SOS is still active.",
        );
      })
      .finally(() => setIsCancelling(false));
  }, [sosId, stopHold]);

  const startHold = useCallback(() => {
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / HOLD_TO_CANCEL_MS);
      setHoldProgress(progress);

      if (progress >= 1) {
        deactivate();
        return;
      }

      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
  }, [deactivate]);

  useEffect(() => stopHold, [stopHold]);

  /** Closes the capture window the server asked for and ships the clip. */
  useEffect(() => {
    if (recordingUntil === null || sosId === null) return;

    const timer = window.setTimeout(
      () => {
        const recording = recorderRef.current;
        recorderRef.current = null;
        setRecordingUntil(null);

        recording
          ?.stop()
          .then((file) => (file ? uploadDuressAudio(sosId, file) : null))
          .catch(() => {
            // A missing clip must never surface over the live SOS status.
          });
      },
      Math.max(0, recordingUntil - Date.now()),
    );

    return () => window.clearTimeout(timer);
  }, [recordingUntil, sosId]);

  // Never leave the microphone open if the component goes away mid-capture.
  useEffect(
    () => () => {
      recorderRef.current?.stop();
      recorderRef.current = null;
    },
    [],
  );

  // Lock the page behind the dialog and wire up Escape.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        ref={fabRef}
        className={[
          "sos-fab",
          isActive ? "is-active" : "",
          fabPosition ? "sos-fab--placed" : "",
          isDragging ? "is-dragging" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={fabPosition ? { left: fabPosition.x, top: fabPosition.y } : undefined}
        {...dragHandlers}
        onClick={() => {
          // Ignore the click that ends a drag so moving it never fires SOS.
          if (consumeDrag()) return;

          setIsActive(true);
          setIsOpen(true);

          if (isActive) return;

          // Show the modal immediately, then dispatch — the alert going out
          // must never wait on the location prompt resolving.
          setDispatchError("");
          getCurrentCoordinates()
            .then((coordinates) => {
              setIsLocationLive(coordinates !== null);
              return triggerSos(toApiPoint(coordinates));
            })
            .then((sos) => {
              setSosId(sos.id);

              const deadline = recordingDeadline(sos);
              if (deadline === null) return;

              // Capture is gated by the browser's own microphone prompt.
              return startDuressRecording().then((recording) => {
                if (!recording) return;
                recorderRef.current = recording;
                setRecordingUntil(deadline);
              });
            })
            .catch((error: unknown) => {
              setDispatchError(
                error instanceof Error ? error.message : "Could not reach dispatch. Retrying is advised.",
              );
            });
        }}
        title="Press for SOS · drag to move"
        aria-label={isActive ? "SOS is active — open status" : "Trigger emergency SOS"}
      >
        <span className="sos-fab__label">SOS</span>
        <span className="sos-fab__sub">CLICK</span>
      </button>

      {isOpen && (
        <div
          className="sos-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sos-modal-heading"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div className="sos-modal">
            <div className="sos-modal__grip">
              <span className="sos-modal__handle" aria-hidden="true" />
              {/* Phones hide the header bar, so the sheet needs its own way out
                  that does not cancel the SOS. */}
              <button
                type="button"
                className="sos-modal__sheet-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close without cancelling SOS"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="sos-modal__head">
              <h2 id="sos-modal-heading">SOS</h2>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close">
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="sos-modal__body">
              <div className="sos-location">
                <span className="sos-location__icon" aria-hidden="true">
                  <MapPin size={16} strokeWidth={2} />
                </span>
                <span className="sos-location__text">
                  {isLocationLive ? "Location sharing active" : "Locating you..."}
                </span>
                <span className="live-pill">
                  <span className="live-pill__dot" aria-hidden="true" />
                  Live
                </span>
              </div>

              {recordingUntil !== null && (
                <div className="sos-recording" role="status">
                  <Mic size={15} strokeWidth={2} aria-hidden="true" />
                  Recording ambient audio for command
                </div>
              )}

              {dispatchError && (
                <div className="auth-status auth-status--error sos-dispatch-error" role="alert">
                  {dispatchError}
                </div>
              )}

              <p className="sos-modal__title">SOS is active</p>
              <p className="sos-modal__text">Help is being notified. Stay where you are if possible.</p>

              <div className="sos-pulse" aria-hidden="true">
                <span className="sos-pulse__ring sos-pulse__ring--outer" />
                <span className="sos-pulse__ring sos-pulse__ring--inner" />
                <span className="sos-pulse__core">
                  <svg width="58" height="58" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2.2 4.5 5.4v6.1c0 4.6 3.1 8.9 7.5 10.3 4.4-1.4 7.5-5.7 7.5-10.3V5.4L12 2.2Z"
                      fill="#fff"
                    />
                    <path
                      d="m8.6 12.1 2.4 2.4 4.4-4.6"
                      stroke="#16b364"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>

              <button
                type="button"
                className="sos-cancel"
                onPointerDown={isCancelling ? undefined : startHold}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                onPointerCancel={stopHold}
                disabled={isCancelling}
                aria-label="Hold for two seconds to cancel SOS"
              >
                {isCancelling ? "CANCELLING..." : "CANCEL (Hold 2 sec)"}
                <span
                  className="sos-cancel__progress"
                  style={{ width: `${holdProgress * 100}%` }}
                  aria-hidden="true"
                />
              </button>

              <div className="sos-recipients">
                <p className="sos-recipients__title">Alert will be sent to :</p>
                <hr className="sos-recipients__divider" />

                <div className="sos-recipients__grid">
                  {sosRecipients.map((recipient) => (
                    <div className="sos-recipients__item" key={recipient.id}>
                      <span className="sos-recipients__icon" aria-hidden="true">
                        <Heart size={19} strokeWidth={1.8} />
                      </span>
                      <span className="sos-recipients__label">{recipient.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="sos-background-note">App will continue silently in background</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
