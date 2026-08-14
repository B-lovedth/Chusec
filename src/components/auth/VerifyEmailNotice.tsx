"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { confirmEmailVerification, resendVerificationEmail } from "@/services/auth.service";
import { getPendingVerificationEmail } from "@/lib/pending-verification";
import { useClientSnapshot } from "@/hooks/useClientSnapshot";

const RESEND_COOLDOWN_SECONDS = 45;

export function VerifyEmailNotice() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storedEmail = useClientSnapshot(getPendingVerificationEmail, "");
  const email = searchParams.get("email") ?? storedEmail;
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setNotice("");
    await resendVerificationEmail(email);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setNotice("Verification link sent again.");
  };

  const handleCheck = async () => {
    setNotice("");
    setIsChecking(true);
    const { verified } = await confirmEmailVerification(searchParams.get("token") ?? undefined);

    if (verified) {
      router.push("/auth/verify-email/success");
      return;
    }

    setIsChecking(false);
    setNotice("We haven't seen that link opened yet. Check your inbox and try again.");
  };

  return (
    <div className="notice-card">
      <div className="notice-card__icon">
        <MailCheck size={32} strokeWidth={1.7} />
      </div>

      <h1 className="notice-card__title">Verify your email</h1>
      <p className="notice-card__text">
        We sent a verification link to {email ? <strong>{email}</strong> : "your email address"}. Open it to
        activate your account, then sign in to reach your dashboard.
      </p>

      <div className="notice-card__actions">
        <button type="button" className="btn btn--primary" onClick={handleCheck} disabled={isChecking}>
          {isChecking ? "Checking..." : "I’ve opened the link"}
        </button>
        <Link href="/auth/login" className="btn btn--outline">
          Back to sign in
        </Link>
      </div>

      <p className="notice-card__hint">
        Didn&apos;t get it?{" "}
        <button type="button" onClick={handleResend} disabled={cooldown > 0}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
        </button>
      </p>

      {notice && <p className="notice-card__hint">{notice}</p>}
    </div>
  );
}
