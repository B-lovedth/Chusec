"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getCitizenDashboard } from "@/services/dashboard.service";
import type { CitizenDashboardResponse } from "@/services/types";

export type CitizenData = {
  data: CitizenDashboardResponse | null;
  status: "loading" | "ready" | "error";
  error: string;
  /** The user's resolved city, for the location chip. */
  city: string;
  refresh: () => void;
};

const CitizenDataContext = createContext<CitizenData | null>(null);

/**
 * One fetch of `GET /api/dashboard/citizen` shared by every citizen screen —
 * it carries the incidents, corridors, corridor warning and resolved city, so
 * nothing downstream has to hardcode a location or re-request.
 */
export function CitizenDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CitizenDashboardResponse | null>(null);
  const [status, setStatus] = useState<CitizenData["status"]>("loading");
  const [error, setError] = useState("");
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;

    getCitizenDashboard()
      .then((response) => {
        if (cancelled) return;
        setData(response);
        setError("");
        setStatus("ready");
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setError(fetchError instanceof Error ? fetchError.message : "Could not load your dashboard.");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return (
    <CitizenDataContext.Provider
      value={{ data, status, error, city: data?.city ?? "", refresh }}
    >
      {children}
    </CitizenDataContext.Provider>
  );
}

export function useCitizenData(): CitizenData {
  const value = useContext(CitizenDataContext);
  if (!value) throw new Error("useCitizenData must be used inside <CitizenDataProvider>");
  return value;
}
