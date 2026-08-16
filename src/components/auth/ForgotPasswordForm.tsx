"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { requestPasswordReset } from "@/services/auth.service";
import { isValidEmail } from "@/lib/validation";

/**
 * No design was supplied for this screen — it reuses the verification notice
 * shell so the flow is not a dead end from the login page. The API resets by
 * email address only.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not send the reset link.");
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="notice-card">
        <div className="notice-card__icon">
          <KeyRound size={30} strokeWidth={1.7} />
        </div>
        <h1 className="notice-card__title">Reset link sent</h1>
        <p className="notice-card__text">
          If <strong>{email}</strong> is registered, a reset link is on its way. Open it to choose a new
          password.
        </p>
        <div className="notice-card__actions">
          <Link href="/auth/login" className="btn btn--primary">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="notice-card">
      <div className="notice-card__icon">
        <KeyRound size={30} strokeWidth={1.7} />
      </div>

      <h1 className="notice-card__title">Forgot password</h1>
      <p className="notice-card__text">
        Enter the email address on your account and we&apos;ll send a reset link.
      </p>

      <form className="notice-card__form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email address"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
          }}
          placeholder="chidiokafor@gmail.com"
          autoComplete="email"
          error={error}
          icon={<Mail size={17} strokeWidth={1.8} />}
        />

        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="notice-card__hint">
        <Link href="/auth/login">Back to sign in</Link>
      </p>
    </div>
  );
}
