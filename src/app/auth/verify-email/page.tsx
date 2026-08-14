import { Suspense } from "react";
import { VerifyEmailNotice } from "@/components/auth/VerifyEmailNotice";

export default function VerifyEmailPage() {
  return (
    <main className="auth-centered">
      <Suspense fallback={<div className="notice-card" />}>
        <VerifyEmailNotice />
      </Suspense>
    </main>
  );
}
