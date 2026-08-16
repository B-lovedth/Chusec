"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MailCheck, TriangleAlert } from "lucide-react";
import { resendVerificationEmail, verifyEmailToken } from "@/services/auth.service";
import { getPendingVerificationEmail } from "@/lib/pending-verification";
import { useClientSnapshot } from "@/hooks/useClientSnapshot";

const RESEND_COOLDOWN_SECONDS = 45;

export function VerifyEmailNotice() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const storedEmail = useClientSnapshot(getPendingVerificationEmail, "");
  const email = searchParams.get("email") ?? storedEmail;

  const [failure, setFailure] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState("");
  const [isResending, setIsResending] = useState(false);

  /**
   * The emailed link lands here with `?token=…`. Confirm it, then hand the
   * user to the success screen, which sends them on to sign in.
   */
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    verifyEmailToken(token)
      .then(() => {
        if (!cancelled) router.replace("/auth/verify-email/success");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setFailure(
          error instanceof Error
            ? error.message
            : "That verification link is invalid or has expired.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !email || isResending) return;

    setNotice("");
    setIsResending(true);

    try {
      await resendVerificationEmail(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setNotice("Verification link sent again.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not resend the link.");
    } finally {
      setIsResending(false);
    }
  };

  const isVerifying = Boolean(token) && !failure;

  if (isVerifying) {
    return (
      <div className="notice-card">
        <div className="notice-card__icon">
          <span className="spinner" aria-hidden="true" />
        </div>
        <h1 className="notice-card__title">Verifying your email</h1>
        <p className="notice-card__text" role="status">
          One moment while we confirm your link.
        </p>
      </div>
    );
  }

  return (
    <div className="notice-card">
      <div className={failure ? "notice-card__icon notice-card__icon--warn" : "notice-card__icon"}>
        {failure ? <TriangleAlert size={30} strokeWidth={1.7} /> : <MailCheck size={32} strokeWidth={1.7} />}
      </div>

      <h1 className="notice-card__title">{failure ? "Link didn’t work" : "Verify your email"}</h1>
      <p className="notice-card__text">
        {failure ? (
          failure
        ) : (
          <>
            We sent a verification link to {email ? <strong>{email}</strong> : "your email address"}. Open it
            to activate your account — we&apos;ll take you to sign in from there.
          </>
        )}
      </p>

      <div className="notice-card__actions">
        <Link href="/auth/login" className="btn btn--primary">
          Continue to sign in
        </Link>
      </div>

      <p className="notice-card__hint">
        {failure ? "Need a new link?" : "Didn’t get it?"}{" "}
        <button type="button" onClick={handleResend} disabled={cooldown > 0 || isResending || !email}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
        </button>
      </p>

      {notice && (
        <p className="notice-card__hint" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}
