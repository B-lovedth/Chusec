"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar, type NavItem } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SosLauncher } from "@/components/sos/SosLauncher";

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

export function GlobalChrome({ children }: GlobalChromeProps) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");
  const isCommandRoute = pathname.startsWith("/admin");

  if (isAuthRoute) return <>{children}</>;

  // The command centre is desktop-first: no bottom tab bar, no SOS launcher.
  if (isCommandRoute) {
    return (
      <>
        <Navbar items={commandNavItems} profileHref="/admin/profile" alwaysVisible />
        {children}
      </>
    );
  }

  return (
    <>
      <Navbar />
      {children}
      <SosLauncher />
      <BottomNav />
    </>
  );
}
