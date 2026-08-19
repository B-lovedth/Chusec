"use client";

import { useEffect, useState } from "react";
import { serverNow } from "@/lib/server-clock";

/**
 * Returns the server-corrected time, refreshed once a second.
 *
 * This is deliberately the *only* thing that ticks. Durations are derived as
 * `tick - startedAt`, never accumulated, so a reload, a tab switch, a phone
 * locking itself or a session closing entirely all recompute to the right
 * value the moment the component mounts again.
 *
 * Background tabs throttle timers and mobile browsers freeze them outright,
 * which is why the value is also re-read when the page becomes visible again —
 * otherwise the first frame after returning would show a stale count.
 */
export function useServerTick(isRunning = true): number {
  const [now, setNow] = useState(() => serverNow());

  useEffect(() => {
    if (!isRunning) return;

    // Align to the next whole second so the readout doesn't appear to skip.
    const read = () => setNow(serverNow());
    read();

    const timer = window.setInterval(read, 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") read();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", read);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", read);
    };
  }, [isRunning]);

  return now;
}
