import { CircleAlert, Radio, Users, Truck, ShieldCheck } from "lucide-react";
import type { CommandStat, StatKey } from "@/data/admin";

const icons: Record<StatKey, typeof CircleAlert> = {
  active: CircleAlert,
  liveSos: Radio,
  citizensAlerted: Users,
  unitDeployed: Truck,
  resolvedToday: ShieldCheck,
};

const placeholders: { key: StatKey; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "liveSos", label: "Live SOS" },
  { key: "citizensAlerted", label: "Citizens Alerted" },
  { key: "unitDeployed", label: "Unit Deployed" },
  { key: "resolvedToday", label: "Resolved Today" },
];

type StatCardsProps = {
  stats: CommandStat[];
  isLoading: boolean;
};

export function StatCards({ stats, isLoading }: StatCardsProps) {
  const cards = isLoading ? placeholders.map((entry) => ({ ...entry, value: "" })) : stats;

  return (
    <div className="stat-grid">
      {cards.map((stat) => {
        const Icon = icons[stat.key];

        return (
          <article className={`stat-card stat-card--${stat.key}`} key={stat.key}>
            <div className="stat-card__head">
              <span className="stat-card__icon" aria-hidden="true">
                <Icon size={19} strokeWidth={1.9} />
              </span>
              {stat.label}
            </div>
            <p className="stat-card__value">
              {isLoading ? <span className="skeleton skeleton--stat" /> : stat.value}
            </p>
          </article>
        );
      })}
    </div>
  );
}
