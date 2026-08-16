"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getCurrentUser } from "@/services/auth.service";
import { clearAccessToken, getAccessToken } from "@/lib/session";
import { toUserProfile } from "@/lib/mappers";
import { areaForRole, type AppArea } from "@/lib/roles";
import { isTokenExpired, roleFromToken } from "@/lib/jwt";
import type { UserProfile } from "@/data/dashboard";
import type { UserResponse } from "@/services/types";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

export type Session = {
  status: SessionStatus;
  user: UserProfile | null;
  role: string;
  area: AppArea;
  /**
   * Adopts a profile the caller has already fetched. Login uses this so the
   * session is authenticated *before* it navigates — going through `refresh`
   * would leave the status stale while the re-fetch is in flight, and the
   * route guard would bounce the user straight back to the login screen.
   */
  signIn: (profile: UserResponse) => void;
  /** Background re-read, e.g. after the user edits their profile. */
  refresh: () => void;
  signOut: () => void;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState("");
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((value) => value + 1), []);

  const signIn = useCallback((profile: UserResponse) => {
    setUser(toUserProfile(profile));
    setRole(profile.role || roleFromToken(getAccessToken()));
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setRole("");
    setStatus("anonymous");
  }, []);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      const token = getAccessToken();

      if (!token || isTokenExpired(token)) {
        if (token) clearAccessToken();
        return { status: "anonymous" as const, user: null, role: "" };
      }

      const profile = await getCurrentUser();

      return {
        status: "authenticated" as const,
        user: toUserProfile(profile),
        // The API is authoritative; the token's own claim is the fallback.
        role: profile.role || roleFromToken(token),
      };
    };

    resolve()
      .then((next) => {
        if (cancelled) return;
        setUser(next.user);
        setRole(next.role);
        setStatus(next.status);
      })
      .catch(() => {
        if (cancelled) return;
        clearAccessToken();
        setUser(null);
        setRole("");
        setStatus("anonymous");
      });

    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const value = useMemo<Session>(
    () => ({ status, user, role, area: areaForRole(role), signIn, refresh, signOut }),
    [status, user, role, signIn, refresh, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside <SessionProvider>");
  return session;
}
