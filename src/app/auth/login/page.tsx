import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="auth-centered">
      <Suspense fallback={<div className="auth-card" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
