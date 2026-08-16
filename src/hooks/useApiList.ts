"use client";

import { useEffect, useState } from "react";

export type ApiListState<T> = {
  status: "loading" | "ready" | "error";
  items: T[];
  error: string;
};

/**
 * Loads a list from the API. There is no fixture fallback — screens show a
 * real loading, empty or error state. Pass a module-level `load` so the effect
 * does not re-run on every render.
 */
export function useApiList<T>(load: () => Promise<T[]>): ApiListState<T> {
  const [state, setState] = useState<ApiListState<T>>({ status: "loading", items: [], error: "" });

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
  }, [load]);

  return state;
}
