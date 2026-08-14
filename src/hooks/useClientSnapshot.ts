"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Reads a browser-only value without a state-setting effect: the server (and
 * the hydration pass) sees `serverValue`, the client sees `read()`.
 *
 * `read` must return a value that is stable under `Object.is` between calls,
 * otherwise React will re-render in a loop. Pass `subscribe` when the value
 * can change after mount so React knows to re-read it.
 */
export function useClientSnapshot<T>(
  read: () => T,
  serverValue: T,
  subscribe: (onStoreChange: () => void) => () => void = noopSubscribe,
): T {
  return useSyncExternalStore(subscribe, read, () => serverValue);
}
