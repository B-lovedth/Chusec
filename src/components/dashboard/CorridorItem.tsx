import type { TransitCorridor } from "@/data/dashboard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";

type CorridorItemProps = {
  corridor: TransitCorridor;
};

export function CorridorItem({ corridor }: CorridorItemProps) {
  return (
    <div className="list-row">
      <div>
        <h4 className="list-row__title">{corridor.name}</h4>
        <p className="list-row__meta">
          {corridor.description} · {corridor.distance}
        </p>
      </div>

      <SeverityBadge severity={corridor.severity} />
    </div>
  );
}
