"use client";

import { useEffect, useState } from "react";

export type ApiListState<T> = {
  status: "loading" | "ready" | "fallback";
  items: T[];
};

/**
 * Loads a list from the API, falling back to fixture data when the request
 * fails — most often a 401, since several endpoints need a session. Pass
 * module-level functions and arrays so the effect does not re-run.
 */
export function useApiList<T>(load: () => Promise<T[]>, fallback: T[]): ApiListState<T> {
  const [state, setState] = useState<ApiListState<T>>({ status: "loading", items: [] });

  useEffect(() => {
    let cancelled = false;

    load()
      .then((items) => {
        if (!cancelled) setState({ status: "ready", items });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "fallback", items: fallback });
      });

    return () => {
      cancelled = true;
    };
  }, [load, fallback]);

  return state;
}
