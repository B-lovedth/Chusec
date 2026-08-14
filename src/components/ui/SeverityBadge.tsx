import type { Severity } from "@/data/dashboard";

type SeverityBadgeProps = {
  severity: Severity;
};

const severityMap: Record<Severity, { className: string; dotClass: string }> = {
  Critical: { className: "severity-badge severity-badge--critical", dotClass: "severity-dot severity-dot--critical" },
  High: { className: "severity-badge severity-badge--high", dotClass: "severity-dot severity-dot--high" },
  Medium: { className: "severity-badge severity-badge--medium", dotClass: "severity-dot severity-dot--medium" },
  Low: { className: "severity-badge severity-badge--low", dotClass: "severity-dot severity-dot--low" },
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = severityMap[severity];

  return (
    <span className={config.className}>
      <span className={config.dotClass} />
      {severity}
    </span>
  );
}
