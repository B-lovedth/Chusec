import type { TransitCorridor } from "@/data/dashboard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";

type CorridorItemProps = {
  corridor: TransitCorridor;
};

export function CorridorItem({ corridor }: CorridorItemProps) {
  return (
    <div className="corridor-item">
      <div className="corridor-item__info">
        <h4>
          {corridor.from} <span>→</span> {corridor.to}
        </h4>
        <small>
          {corridor.description} · {corridor.distance}
        </small>
      </div>

      <SeverityBadge severity={corridor.severity} />
    </div>
  );
}
