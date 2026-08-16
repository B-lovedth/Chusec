"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useSession } from "@/components/auth/SessionProvider";


export type NavItem = {
  label: string;
  href: string;
};

const citizenNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Alerts", href: "/alerts" },
  { label: "Report", href: "/report" },
  { label: "Profile", href: "/profile" },
];

type NavbarProps = {
  /** Defaults to the citizen tabs; the command centre passes its own. */
  items?: NavItem[];
  profileHref?: string;
  /** Command centre is desktop-first and keeps its nav at every width. */
  alwaysVisible?: boolean;
};

export function Navbar({
  items = citizenNavItems,
  profileHref = "/profile",
  alwaysVisible = false,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = items;
  const [menuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useSession();

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    signOut();
    router.replace("/auth/login");
  };

  return (
    <header className={alwaysVisible ? "topbar topbar--persistent" : "topbar"}>
      <Link href={navItems[0]?.href ?? "/dashboard"} aria-label="Chusec home">
        <Image src="/logo.png" alt="Chusec" width={103} height={40} className="topbar__logo" priority />
      </Link>

      <div className="topbar__cluster">
        <nav className="topbar__nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "topbar__nav-item is-active" : "topbar__nav-item"}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button type="button" className="topbar__bell" aria-label="Notifications">
          <Bell size={20} strokeWidth={1.9} />
          <span className="topbar__bell__dot" aria-hidden="true" />
        </button>

        <div className="topbar__account" ref={accountRef}>
          <button
            type="button"
            className="topbar__user"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <Image src={user?.avatar ?? "/avatar-placeholder.svg"} alt="" width={42} height={42} unoptimized />
            <span className="topbar__user__name">{user?.firstName ?? ""}</span>
            <ChevronDown size={16} strokeWidth={2} className="topbar__user__chevron" />
          </button>

          {menuOpen && (
            <div className="topbar__menu" role="menu">
              <Link
                href={profileHref}
                role="menuitem"
                className="topbar__menu__item"
                onClick={() => setMenuOpen(false)}
              >
                <User size={16} strokeWidth={1.9} />
                My Profile
              </Link>

              <Link
                href={profileHref}
                role="menuitem"
                className="topbar__menu__item"
                onClick={() => setMenuOpen(false)}
              >
                <Settings size={16} strokeWidth={1.9} />
                Account settings
              </Link>

              <hr className="topbar__menu__divider" />

              <button
                type="button"
                role="menuitem"
                className="topbar__menu__item topbar__menu__item--danger"
                onClick={handleLogout}
              >
                <LogOut size={16} strokeWidth={1.9} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
