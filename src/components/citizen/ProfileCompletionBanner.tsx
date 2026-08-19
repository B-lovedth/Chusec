"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useSession } from "@/components/auth/SessionProvider";

/**
 * Shown while `is_profile_complete` is false. NIN and emergency contact are
 * what lets responders identify and reach someone during an SOS, so the prompt
 * stays up rather than being dismissible — it disappears the moment the API
 * reports the profile complete.
 */
export function ProfileCompletionBanner() {
  const { status, user } = useSession();
  const pathname = usePathname();

  if (status !== "authenticated" || !user || user.isProfileComplete) return null;

  // No point nagging on the screen that fixes it.
  if (pathname.startsWith("/settings")) return null;

  const missing = [
    user.nin.trim() ? null : "your NIN",
    user.emergencyContact.trim() ? null : "an emergency contact",
  ].filter(Boolean);

  return (
    <div className="profile-banner" role="status">
      <span className="profile-banner__icon" aria-hidden="true">
        <ShieldAlert size={18} strokeWidth={1.9} />
      </span>

      <p className="profile-banner__text">
        <strong>Finish setting up your profile.</strong>{" "}
        {missing.length > 0
          ? `Add ${missing.join(" and ")} so responders can identify and reach you in an emergency.`
          : "Responders need your full details to identify and reach you in an emergency."}
      </p>

      <Link href="/settings" className="profile-banner__action">
        Complete profile
      </Link>
    </div>
  );
}
