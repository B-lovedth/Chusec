"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar, type NavItem } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SosLauncher } from "@/components/sos/SosLauncher";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DesktopOnly } from "@/components/layout/DesktopOnly";
import { ProfileCompletionBanner } from "@/components/citizen/ProfileCompletionBanner";
import { CitizenDataProvider } from "@/components/citizen/CitizenDataProvider";
import { BeaconProvider } from "@/components/citizen/BeaconProvider";

const commandNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "History", href: "/admin/history" },
  { label: "Unit", href: "/admin/unit" },
  { label: "User access", href: "/admin/user-access" },
  { label: "Profile", href: "/admin/profile" },
];

/** Responding units get a shorter nav — no Unit or User access. */
const unitNavItems: NavItem[] = [
  { label: "Dashboard", href: "/unit/dashboard" },
  { label: "Comms", href: "/unit/comms" },
  { label: "History", href: "/unit/history" },
  { label: "Profile", href: "/unit/profile" },
];

type GlobalChromeProps = {
  children: ReactNode;
};

function AppChrome({ children }: GlobalChromeProps) {
  const pathname = usePathname();

  // Command centre and unit portals are desktop-first: no bottom tab bar and
  // no SOS launcher — those belong to the citizen app.
  if (pathname.startsWith("/admin")) {
    return (
      <DesktopOnly>
        <Navbar items={commandNavItems} profileHref="/admin/profile" alwaysVisible />
        <RouteGuard>{children}</RouteGuard>
      </DesktopOnly>
    );
  }

  if (pathname.startsWith("/unit")) {
    return (
      <>
        <Navbar items={unitNavItems} profileHref="/unit/profile" alwaysVisible />
        <RouteGuard>{children}</RouteGuard>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <RouteGuard>
        <ProfileCompletionBanner />
        <CitizenDataProvider>
          {/* Pings run app-wide, not just on the Settings screen. */}
          <BeaconProvider>{children}</BeaconProvider>
        </CitizenDataProvider>
      </RouteGuard>
      <SosLauncher />
      <BottomNav />
    </>
  );
}

export function GlobalChrome({ children }: GlobalChromeProps) {
  const pathname = usePathname();

  return (
    <SessionProvider>
      {pathname.startsWith("/auth") ? children : <AppChrome>{children}</AppChrome>}
    </SessionProvider>
  );
}
