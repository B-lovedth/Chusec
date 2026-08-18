"use client";

import { useCallback, useEffect, useState } from "react";

export type ApiListState<T> = {
  status: "loading" | "ready" | "error";
  items: T[];
  error: string;
  /** Re-fetches — used after a create or delete. */
  reload: () => void;
};

/**
 * Loads a list from the API. There is no fixture fallback — screens show a
 * real loading, empty or error state. Pass a module-level `load` so the effect
 * does not re-run on every render.
 */
export function useApiList<T>(load: () => Promise<T[]>): ApiListState<T> {
  const [state, setState] = useState<Omit<ApiListState<T>, "reload">>({
    status: "loading",
    items: [],
    error: "",
  });
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;

    load()
      .then((items) => {
        if (!cancelled) setState({ status: "ready", items, error: "" });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          items: [],
          error: error instanceof Error ? error.message : "Could not load this list.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [load, nonce]);

  return { ...state, reload };
}
