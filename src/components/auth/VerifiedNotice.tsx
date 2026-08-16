"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { clearPendingVerificationEmail } from "@/lib/pending-verification";

const REDIRECT_SECONDS = 3;

export function VerifiedNotice() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    clearPendingVerificationEmail();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      // `replace` so Back does not land on the spent verification link.
      router.replace("/auth/login");
      return;
    }

    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, router]);

  return (
    <div className="notice-card">
      <div className="notice-card__icon notice-card__icon--success">
        <BadgeCheck size={34} strokeWidth={1.7} />
      </div>

      <h1 className="notice-card__title">Email verified</h1>
      <p className="notice-card__text">
        Your account is active. Sign in with your phone number and password to reach your dashboard.
      </p>

      <div className="notice-card__actions">
        <Link href="/auth/login" className="btn btn--primary">
          Continue to login
        </Link>
      </div>

      <p className="notice-card__hint" aria-live="polite">
        Taking you to sign in in {secondsLeft}s
      </p>
    </div>
  );
}
