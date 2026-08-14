"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Phone, ScanFace } from "lucide-react";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { TextField } from "@/components/ui/TextField";
import { loginUser } from "@/services/auth.service";
import { isValidNigerianPhone } from "@/lib/validation";

type Errors = Partial<Record<"phoneNumber" | "password", string>>;

export function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ phoneNumber: "", password: "" });
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
    if (!isValidNigerianPhone(form.phoneNumber)) next.phoneNumber = "Enter a valid Nigerian phone number.";
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
      router.push("/dashboard");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not sign you in. Try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <AuthBrand title="Login to your account" />

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Phone number"
          name="phoneNumber"
          type="tel"
          required
          value={form.phoneNumber}
          onChange={handleChange}
          placeholder="08181804434"
          autoComplete="tel"
          error={errors.phoneNumber}
          icon={<Phone size={17} strokeWidth={1.8} />}
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
