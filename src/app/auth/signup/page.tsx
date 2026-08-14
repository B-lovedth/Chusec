"use client";

import { MobileOnboarding } from "@/components/auth/MobileOnboarding";
import { PromoPanel } from "@/components/auth/PromoPanel";
import { SignupForm } from "@/components/auth/SignupForm";
import { useOnboardingPhase } from "@/hooks/useOnboardingPhase";

export default function SignupPage() {
  const { phase, complete } = useOnboardingPhase();

  return (
    <main className="auth-split" data-phase={phase}>
      <PromoPanel />

      <div className="auth-split__form">
        <SignupForm />
      </div>

      {phase === "onboarding" && <MobileOnboarding onDone={complete} />}
    </main>
  );
}
