"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AtSign, Lock, ScanFace } from "lucide-react";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { BackButton } from "@/components/auth/BackButton";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/components/auth/SessionProvider";
import {
  getCurrentUser,
  isUnverifiedEmailError,
  loginUser,
  resendVerificationEmail,
} from "@/services/auth.service";
import { isValidEmail, isValidNigerianPhone } from "@/lib/validation";
import { setPendingVerificationEmail } from "@/lib/pending-verification";
import { areaForPath, areaForRole, areaHome } from "@/lib/roles";

type Errors = Partial<Record<"identifier" | "password", string>>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useSession();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const next: Errors = {};
    const identifier = form.identifier.trim();

    if (!isValidEmail(identifier) && !isValidNigerianPhone(identifier)) {
      next.identifier = "Enter your email address or phone number.";
    }
    if (!form.password) next.password = "Enter your password.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await loginUser(form);

      // The role decides which dashboard the user lands on.
      const profile = await getCurrentUser();
      const area = areaForRole(profile.role);

      // Honour ?next= only when it belongs to the user's own area.
      const next = searchParams.get("next");
      const target = next && areaForPath(next) === area ? next : areaHome[area];

      // Must run before navigating, or the guard sees a stale signed-out
      // session and sends the user back here.
      signIn(profile);
      router.replace(target);
    } catch (error) {
      // An unverified address is not a failed login — send them to finish
      // verifying rather than leaving them guessing at the password.
      if (isUnverifiedEmailError(error)) {
        const identifier = form.identifier.trim();
        // Resending needs the address; a phone login gives us nothing to send
        // to, so the notice screen asks for one instead.
        const email = isValidEmail(identifier) ? identifier : "";

        setPendingVerificationEmail(email);
        if (email) {
          // Fire and forget — the screen offers a manual resend either way.
          resendVerificationEmail(email).catch(() => {});
        }

        // Same screen signup uses; it reads the stored address and can resend.
        router.replace("/auth/verify-email");
        return;
      }

      setFormError(error instanceof Error ? error.message : "Could not sign you in. Try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <BackButton />
      <AuthBrand title="Login to your account" />

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email or phone number"
          name="identifier"
          type="text"
          required
          value={form.identifier}
          onChange={handleChange}
          placeholder="chidiokafor@gmail.com"
          autoComplete="username"
          error={errors.identifier}
          icon={<AtSign size={17} strokeWidth={1.8} />}
        />

        <TextField
          label="Password"
          name="password"
          revealable
          value={form.password}
          onChange={handleChange}
          placeholder="************"
          autoComplete="current-password"
          error={errors.password}
          icon={<Lock size={17} strokeWidth={1.8} />}
        />

        <Link href="/auth/forgot-password" className="login-forgot">
          Forgot password?
        </Link>

        {formError && (
          <div className="auth-status auth-status--error" role="alert">
            {formError}
          </div>
        )}

        <div className="login-actions">
          <button type="submit" className="btn btn--primary login-submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <button type="button" className="login-biometric" aria-label="Login with face ID">
            <ScanFace size={23} strokeWidth={1.7} />
          </button>
        </div>

        <p className="auth-switch">
          Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
