import type { IncidentOutcome } from "@/data/admin";

type Group = {
  label: string;
  tone: "victim" | "criminal" | "agency";
  rows: { label: string; value: number; grave?: boolean }[];
};

/**
 * The clearance report's counters, grouped the way the unit files them.
 * Zeroes are shown rather than hidden — "0 dead" is a result, and a blank row
 * would read as missing data on a casualty report.
 */
function toGroups(outcome: IncidentOutcome): Group[] {
  return [
    {
      label: "Victims",
      tone: "victim",
      rows: [
        { label: "Injured", value: outcome.victimsInjured },
        { label: "Dead", value: outcome.victimsDead, grave: true },
      ],
    },
    {
      label: "Criminals",
      tone: "criminal",
      rows: [
        { label: "Arrested", value: outcome.criminalsArrested },
        { label: "Injured", value: outcome.criminalsInjured },
        { label: "Dead", value: outcome.criminalsDead, grave: true },
      ],
    },
    {
      label: "Operational agency",
      tone: "agency",
      rows: [
        { label: "Injured", value: outcome.agentsInjured },
        { label: "Dead", value: outcome.agentsDead, grave: true },
      ],
    },
  ];
}

export function totalCasualties(outcome: IncidentOutcome) {
  return (
    outcome.victimsInjured +
    outcome.victimsDead +
    outcome.criminalsInjured +
    outcome.criminalsDead +
    outcome.agentsInjured +
    outcome.agentsDead
  );
}

export function IncidentOutcomeSummary({ outcome }: { outcome: IncidentOutcome }) {
  return (
    <div className="outcome-groups">
      {toGroups(outcome).map((group) => (
        <section className={`outcome-group outcome-group--${group.tone}`} key={group.label}>
          <h4 className="outcome-group__label">{group.label}</h4>

          <dl className="outcome-group__rows">
            {group.rows.map((row) => (
              <div className="outcome-stat" key={row.label}>
                <dt>{row.label}</dt>
                <dd className={row.grave && row.value > 0 ? "is-grave" : undefined}>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
