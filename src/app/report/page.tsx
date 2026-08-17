"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { ReportForm } from "@/components/report/ReportForm";
import { useCitizenData } from "@/components/citizen/CitizenDataProvider";

export default function ReportPage() {
  const { city } = useCitizenData();
  const [isAnonymous, setIsAnonymous] = useState(false);

  return (
    <PageShell
      title={isAnonymous ? "Anonymous Report" : "Report"}
      subtitle="Identity protected · GPS auto-captured"
      location={city}
    >
      <ReportForm isAnonymous={isAnonymous} onAnonymousChange={setIsAnonymous} />
    </PageShell>
  );
}
