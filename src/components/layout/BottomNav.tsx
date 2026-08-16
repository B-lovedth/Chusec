"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ClipboardList, CircleUser, Map } from "lucide-react";

/** The dashboard is labelled "Map" in the mobile tab bar. */
const tabs = [
  { label: "Map", href: "/dashboard", Icon: Map },
  { label: "Alerts", href: "/alerts", Icon: Bell },
  { label: "Report", href: "/report", Icon: ClipboardList },
  { label: "Profile", href: "/profile", Icon: CircleUser },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Primary">
      <div className="bottom-nav__surface" aria-hidden="true" />

      <div className="bottom-nav__items">
        {tabs.map((tab, index) => {
          const isActive = pathname === tab.href;

          return (
            <Fragment key={tab.href}>
              <Link
                href={tab.href}
                className={isActive ? "bottom-nav__tab is-active" : "bottom-nav__tab"}
                aria-current={isActive ? "page" : undefined}
              >
                <tab.Icon size={22} strokeWidth={1.8} />
                <span>{tab.label}</span>
              </Link>

              {/* Space the SOS button sits in. */}
              {index === 1 && <span className="bottom-nav__gap" aria-hidden="true" />}
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}
