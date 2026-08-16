"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/components/auth/SessionProvider";
import { areaForPath, areaHome } from "@/lib/roles";
import type { UserProfile } from "@/data/dashboard";

const AuthenticatedUserContext = createContext<UserProfile | null>(null);

/**
 * The signed-in user, non-null. Only valid inside `<RouteGuard>`, which is the
 * only place that can guarantee one exists.
 */
export function useUser(): UserProfile {
  const user = useContext(AuthenticatedUserContext);
  if (!user) throw new Error("useUser must be used inside <RouteGuard>");
  return user;
}

/**
 * Keeps signed-out users out of the app and keeps signed-in users inside the
 * area their role covers. Client-side only — the API is the real gate.
 */
export function RouteGuard({ children }: { children: ReactNode }) {
  const { status, area, user } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const requestedArea = areaForPath(pathname);
  const isAllowed = status === "authenticated" && area === requestedArea && user !== null;

  useEffect(() => {
    if (status === "loading") return;

    if (status === "anonymous") {
      const next = encodeURIComponent(pathname);
      router.replace(`/auth/login?next=${next}`);
      return;
    }

    if (area !== requestedArea) router.replace(areaHome[area]);
  }, [status, area, requestedArea, pathname, router]);

  if (!isAllowed) {
    return (
      <main className="route-guard" aria-busy="true">
        <span className="spinner" aria-hidden="true" />
        <span className="sr-only">Checking your session</span>
      </main>
    );
  }

  return <AuthenticatedUserContext.Provider value={user}>{children}</AuthenticatedUserContext.Provider>;
}
