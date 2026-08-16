"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar, type NavItem } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SosLauncher } from "@/components/sos/SosLauncher";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { RouteGuard } from "@/components/auth/RouteGuard";

const commandNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "History", href: "/admin/history" },
  { label: "Unit", href: "/admin/unit" },
  { label: "User access", href: "/admin/user-access" },
  { label: "Profile", href: "/admin/profile" },
];

type GlobalChromeProps = {
  children: ReactNode;
};

function AppChrome({ children }: GlobalChromeProps) {
  const pathname = usePathname();

  // The command centre is desktop-first: no bottom tab bar, no SOS launcher.
  if (pathname.startsWith("/admin")) {
    return (
      <>
        <Navbar items={commandNavItems} profileHref="/admin/profile" alwaysVisible />
        <RouteGuard>{children}</RouteGuard>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <RouteGuard>{children}</RouteGuard>
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
