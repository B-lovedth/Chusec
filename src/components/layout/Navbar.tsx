"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown } from "lucide-react";
import { currentUser } from "@/data/dashboard";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Alerts", href: "/alerts" },
  { label: "Report", href: "/report" },
  { label: "Profile", href: "/profile" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="topbar">
      <div className="topbar__brand" aria-label="Chusec brand">
        <Image src="/logo.png" alt="Chusec" width={132} height={44} className="topbar__logo" priority />
      </div>

      <nav className="topbar__nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "topbar__nav-item is-active" : "topbar__nav-item"}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="topbar__actions">
        <button type="button" className="topbar__notification" aria-label="Notifications">
          <Bell size={18} strokeWidth={2.2} />
        </button>

        <div className="topbar__user" aria-label="User account menu">
          <div className="user-avatar">
            <img src={currentUser.avatar} alt={currentUser.name} />
          </div>
          <span className="user-name">{currentUser.name}</span>
          <ChevronDown size={16} strokeWidth={2} className="user-chevron" />
        </div>
      </div>
    </header>
  );
}
