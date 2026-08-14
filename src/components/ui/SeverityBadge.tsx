import type { Severity } from "@/data/dashboard";

type SeverityBadgeProps = {
  severity: Severity;
};

const modifier: Record<Severity, string> = {
  Critical: "critical",
  High: "high",
  Medium: "medium",
  Low: "low",
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return <span className={`severity-badge severity-badge--${modifier[severity]}`}>{severity}</span>;
}
