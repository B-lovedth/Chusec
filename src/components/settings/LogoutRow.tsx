"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSession } from "@/components/auth/SessionProvider";

/**
 * Phones hide the top bar, so the account dropdown that holds Logout is out of
 * reach there. This is the mobile-only way out; desktop keeps using the menu.
 */
export function LogoutRow() {
  const router = useRouter();
  const { signOut } = useSession();

  const handleLogout = () => {
    signOut();
    router.replace("/auth/login");
  };

  return (
    <button type="button" className="logout-row" onClick={handleLogout}>
      <LogOut size={17} strokeWidth={1.9} />
      Log out
    </button>
  );
}
