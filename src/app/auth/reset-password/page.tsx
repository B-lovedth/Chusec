import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="auth-centered">
      <Suspense fallback={<div className="notice-card" />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
