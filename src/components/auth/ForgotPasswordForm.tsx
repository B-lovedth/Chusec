"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Phone } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { isValidNigerianPhone } from "@/lib/validation";

/**
 * No design was supplied for this screen — it reuses the verification notice
 * shell so the flow is not a dead end from the login page.
 */
export function ForgotPasswordForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidNigerianPhone(phoneNumber)) {
      setError("Enter a valid Nigerian phone number.");
      return;
    }

    setError("");
    setSent(true);
  };

  if (sent) {
    return (
      <div className="notice-card">
        <div className="notice-card__icon">
          <KeyRound size={30} strokeWidth={1.7} />
        </div>
        <h1 className="notice-card__title">Reset link sent</h1>
        <p className="notice-card__text">
          If <strong>{phoneNumber}</strong> is registered, a reset link is on its way.
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
        Enter the phone number on your account and we&apos;ll send a reset link.
      </p>

      <form className="notice-card__form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Phone number"
          name="phoneNumber"
          type="tel"
          required
          value={phoneNumber}
          onChange={(event) => {
            setPhoneNumber(event.target.value);
            setError("");
          }}
          placeholder="08181804434"
          autoComplete="tel"
          error={error}
          icon={<Phone size={17} strokeWidth={1.8} />}
        />

        <button type="submit" className="btn btn--primary">
          Send reset link
        </button>
      </form>

      <p className="notice-card__hint">
        <Link href="/auth/login">Back to sign in</Link>
      </p>
    </div>
  );
}
