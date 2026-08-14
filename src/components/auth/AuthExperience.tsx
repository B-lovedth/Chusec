"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { loginUser, registerUser } from "@/services";

type AuthExperienceProps = {
  mode: "signup" | "login";
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

const initialFormState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

export function AuthExperience({ mode }: AuthExperienceProps) {
  const isSignup = mode === "signup";
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const pageTitle = useMemo(
    () => (isSignup ? "Create your new account" : "Login to your account"),
    [isSignup],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (isSignup && formData.password !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignup) {
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        };

        const result = await registerUser(payload);
        setStatus({
          type: "success",
          message: `Welcome ${result.name || "there"}! Your account was created successfully.`,
        });
      } else {
        const result = await loginUser({
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        });

        setStatus({
          type: "success",
          message: `Logged in successfully. Welcome back, ${result.user.name}.`,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setStatus({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="brand-row" aria-label="Chusec brand">
        <Image src="/logo.png" alt="Chusec" width={156} height={52} className="brand-logo" priority />
      </div>

      <h1 className="auth-heading">{pageTitle}</h1>

      <form onSubmit={handleSubmit} className="auth-form">
        {isSignup && (
          <div className="name-grid">
            <label className="field-group">
              <span>First name <span className="required">*</span></span>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Chidi"
                autoComplete="given-name"
              />
            </label>

            <label className="field-group">
              <span>Last name <span className="required">*</span></span>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Okafor"
                autoComplete="family-name"
              />
            </label>
          </div>
        )}

        {isSignup && (
          <label className="field-group">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="chidiokafor@gmail.com"
              autoComplete="email"
            />
          </label>
        )}

        <label className="field-group">
          <span>{isSignup ? "Phone number" : "Phone number"} <span className="required">*</span></span>
          <div className="input-with-icon">
            <span className="input-icon">☎</span>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="08181404434"
              autoComplete="tel"
            />
          </div>
          {isSignup && <small>+234 (Nigeria) only</small>}
        </label>

        <label className="field-group">
          <span>Password</span>
          <div className="input-with-icon input-with-action">
            <span className="input-icon">◌</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="**********"
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "◉" : "◌"}
            </button>
          </div>
          {isSignup && <small>Min. 8 chars • uppercase • number • symbol</small>}
        </label>

        {isSignup && (
          <label className="field-group">
            <span>Confirm Password</span>
            <div className="input-with-icon input-with-action">
              <span className="input-icon">◌</span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="**********"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? "◉" : "◌"}
              </button>
            </div>
          </label>
        )}

        {isSignup && (
          <label className="checkbox-row">
            <input type="checkbox" defaultChecked />
            <span>
              I agree to the Terms of Use and understand that this app is for community safety reporting only.
            </span>
          </label>
        )}

        {!isSignup && (
          <div className="link-row">
            <Link href="/auth/forgot-password">Forgot password?</Link>
          </div>
        )}

        {status && (
          <div className={`status-message ${status.type}`} role="alert">
            {status.message}
          </div>
        )}

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? (isSignup ? "Creating..." : "Logging in...") : isSignup ? "Create Account" : "Login"}
          </button>
          {!isSignup && (
            <button type="button" className="scan-button" aria-label="Use biometric scan">
              <span>◍</span>
            </button>
          )}
        </div>

        <p className="switch-copy">
          {isSignup ? "Already have an account?" : "Don&apos;t have an account?"}{" "}
          <Link href={isSignup ? "/auth/login" : "/auth/signup"}>
            {isSignup ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </form>
    </div>
  );
}
