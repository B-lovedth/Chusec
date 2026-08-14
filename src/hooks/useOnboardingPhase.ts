"use client";

import { useCallback, useState } from "react";
import { useClientSnapshot } from "@/hooks/useClientSnapshot";

const STORAGE_KEY = "chusec.onboarding.completed";

/** Must stay in sync with the `tablet` breakpoint in `_mixins.scss`. */
const COMPACT_QUERY = "(max-width: 1023px)";

export type OnboardingPhase = "loading" | "onboarding" | "form";

function readCompleted() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function readPhase(): OnboardingPhase {
  const isCompact = window.matchMedia(COMPACT_QUERY).matches;
  return isCompact && !readCompleted() ? "onboarding" : "form";
}

/** Re-reads the phase when the viewport crosses the compact breakpoint. */
function subscribeToBreakpoint(onChange: () => void) {
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * On compact viewports the signup carousel is promoted to a one-time
 * onboarding flow. The decision can only be made on the client, so the page
 * renders in a `loading` phase for the server and hydration pass.
 */
export function useOnboardingPhase() {
  const [completedThisVisit, setCompletedThisVisit] = useState(false);
  const storedPhase = useClientSnapshot<OnboardingPhase>(readPhase, "loading", subscribeToBreakpoint);

  const complete = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Storage unavailable (private mode) — onboarding replays next visit.
    }
    setCompletedThisVisit(true);
  }, []);

  return { phase: completedThisVisit ? "form" : storedPhase, complete };
}
