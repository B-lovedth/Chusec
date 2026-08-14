import { PageShell } from "@/components/layout/PageShell";
import { ReportForm } from "@/components/report/ReportForm";
import { currentUser } from "@/data/dashboard";

export default function ReportPage() {
  return (
    <PageShell title="Report" subtitle="Identity protected · GPS auto-captured" location={currentUser.location}>
      <ReportForm />
    </PageShell>
  );
}
