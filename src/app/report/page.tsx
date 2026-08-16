"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { ReportForm } from "@/components/report/ReportForm";
import { useUser } from "@/components/auth/RouteGuard";

export default function ReportPage() {
  const user = useUser();
  const [isAnonymous, setIsAnonymous] = useState(false);

  return (
    <PageShell
      title={isAnonymous ? "Anonymous Report" : "Report"}
      subtitle="Identity protected · GPS auto-captured"
      location={user.location}
    >
      <ReportForm isAnonymous={isAnonymous} onAnonymousChange={setIsAnonymous} />
    </PageShell>
  );
}
