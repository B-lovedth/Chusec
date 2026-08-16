"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleCheck, KeyRound, Lock, TriangleAlert } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { resetPassword } from "@/services/auth.service";
import { checkPassword } from "@/lib/validation";

const REDIRECT_SECONDS = 3;

type Errors = Partial<Record<"password" | "confirmPassword", string>>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (!isDone) return;

    if (secondsLeft <= 0) {
      // `replace` so Back does not return to the spent reset link.
      router.replace("/auth/login");
      return;
    }

    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [isDone, secondsLeft, router]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const next: Errors = {};

    const password = checkPassword(form.password);
    if (!password.valid) next.password = password.message;
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await resetPassword(token, form.password);
      setIsDone(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not reset your password.");
      setIsSubmitting(false);
    }
  };

  // The link is useless without a token — send the user back to request a new one.
  if (!token) {
    return (
      <div className="notice-card">
        <div className="notice-card__icon notice-card__icon--warn">
          <TriangleAlert size={30} strokeWidth={1.7} />
        </div>
        <h1 className="notice-card__title">Link isn&apos;t valid</h1>
        <p className="notice-card__text">
          This reset link is missing its token. Request a new one and open the most recent email.
        </p>
        <div className="notice-card__actions">
          <Link href="/auth/forgot-password" className="btn btn--primary">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="notice-card">
        <div className="notice-card__icon notice-card__icon--success">
          <CircleCheck size={32} strokeWidth={1.7} />
        </div>
        <h1 className="notice-card__title">Password updated</h1>
        <p className="notice-card__text">Sign in with your new password to reach your dashboard.</p>
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

  return (
    <div className="notice-card">
      <div className="notice-card__icon">
        <KeyRound size={30} strokeWidth={1.7} />
      </div>

      <h1 className="notice-card__title">Set a new password</h1>
      <p className="notice-card__text">Choose a password you haven&apos;t used before.</p>

      <form className="notice-card__form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="New password"
          name="password"
          revealable
          value={form.password}
          onChange={handleChange}
          placeholder="************"
          autoComplete="new-password"
          hint="Min. 8 chars · uppercase · number · symbol"
          error={errors.password}
          icon={<Lock size={17} strokeWidth={1.8} />}
        />

        <TextField
          label="Confirm new password"
          name="confirmPassword"
          revealable
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="************"
          autoComplete="new-password"
          error={errors.confirmPassword}
          icon={<Lock size={17} strokeWidth={1.8} />}
        />

        {formError && (
          <div className="auth-status auth-status--error" role="alert">
            {formError}
          </div>
        )}

        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Reset password"}
        </button>
      </form>

      <p className="notice-card__hint">
        <Link href="/auth/login">Back to sign in</Link>
      </p>
    </div>
  );
}
