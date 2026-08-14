"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Lock, Mail, Phone } from "lucide-react";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { TextField } from "@/components/ui/TextField";
import { registerUser } from "@/services/auth.service";
import { setPendingVerificationEmail } from "@/lib/pending-verification";
import { checkPassword, isValidEmail, isValidNigerianPhone } from "@/lib/validation";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

type Errors = Partial<Record<keyof FormState | "terms", string>>;

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
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

    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!isValidNigerianPhone(form.phoneNumber)) next.phoneNumber = "Enter a valid Nigerian phone number.";

    const password = checkPassword(form.password);
    if (!password.valid) next.password = password.message;

    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";
    if (!acceptedTerms) next.terms = "Accept the Terms of Use to continue.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const { verificationEmailSentTo } = await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
      });

      setPendingVerificationEmail(verificationEmailSentTo);
      router.push(`/auth/verify-email?email=${encodeURIComponent(verificationEmailSentTo)}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not create your account. Try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-form">
      <AuthBrand title="Create your new account" />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="signup-names">
          <TextField
            label="First name"
            name="firstName"
            required
            value={form.firstName}
            onChange={handleChange}
            placeholder="Chidi"
            autoComplete="given-name"
            error={errors.firstName}
          />
          <TextField
            label="Last name"
            name="lastName"
            required
            value={form.lastName}
            onChange={handleChange}
            placeholder="Okafor"
            autoComplete="family-name"
            error={errors.lastName}
          />
        </div>

        <TextField
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="chidiokafor@gmail.com"
          autoComplete="email"
          error={errors.email}
          icon={<Mail size={17} strokeWidth={1.8} />}
        />

        <TextField
          label="Phone number"
          name="phoneNumber"
          type="tel"
          required
          value={form.phoneNumber}
          onChange={handleChange}
          placeholder="08181804434"
          autoComplete="tel"
          hint="+234 (Nigeria) only"
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
          autoComplete="new-password"
          hint="Min. 8 chars · uppercase · number · symbol"
          error={errors.password}
          icon={<Lock size={17} strokeWidth={1.8} />}
        />

        <TextField
          label="Confirm Password"
          name="confirmPassword"
          revealable
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="************"
          autoComplete="new-password"
          error={errors.confirmPassword}
          icon={<Lock size={17} strokeWidth={1.8} />}
        />

        <div>
          <label className="signup-terms">
            <span className="checkbox">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => {
                  setAcceptedTerms(event.target.checked);
                  setErrors((current) => ({ ...current, terms: undefined }));
                }}
              />
              <span className="checkbox__box" aria-hidden="true">
                <Check size={12} strokeWidth={3} />
              </span>
            </span>
            <span>
              I agree to the <Link href="/terms">Terms of Use</Link> and understand that this app is for
              community safety reporting only.
            </span>
          </label>
          {errors.terms && <span className="field__error">{errors.terms}</span>}
        </div>

        {formError && (
          <div className="auth-status auth-status--error" role="alert">
            {formError}
          </div>
        )}

        <button type="submit" className="btn btn--primary signup-submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link href="/auth/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
