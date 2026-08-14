"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

type GlobalChromeProps = {
  children: ReactNode;
};

export function GlobalChrome({ children }: GlobalChromeProps) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  return (
    <>
      {!isAuthRoute && <Navbar />}
      {children}
    </>
  );
}