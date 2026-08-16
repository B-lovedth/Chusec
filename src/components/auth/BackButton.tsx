"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/** Shown on compact viewports only — the desktop designs have no back affordance. */
export function BackButton() {
  const router = useRouter();

  return (
    <button type="button" className="auth-back" onClick={() => router.back()} aria-label="Go back">
      <ChevronLeft size={20} strokeWidth={2} />
    </button>
  );
}
