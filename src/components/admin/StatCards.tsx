import { CircleAlert, Radio, Users, Truck, ShieldCheck } from "lucide-react";
import { commandStats, type StatKey } from "@/data/admin";

const icons: Record<StatKey, typeof CircleAlert> = {
  active: CircleAlert,
  liveSos: Radio,
  citizensAlerted: Users,
  unitDeployed: Truck,
  resolvedToday: ShieldCheck,
};

export function StatCards() {
  return (
    <div className="stat-grid">
      {commandStats.map((stat) => {
        const Icon = icons[stat.key];

        return (
          <article className={`stat-card stat-card--${stat.key}`} key={stat.key}>
            <div className="stat-card__head">
              <span className="stat-card__icon" aria-hidden="true">
                <Icon size={19} strokeWidth={1.9} />
              </span>
              {stat.label}
            </div>
            <p className="stat-card__value">{stat.value}</p>
          </article>
        );
      })}
    </div>
  );
}
