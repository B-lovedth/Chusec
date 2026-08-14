import { transitCorridors } from "@/data/dashboard";
import { CorridorItem } from "@/components/dashboard/CorridorItem";

export function TransitCorridors() {
  return (
    <section className="panel">
      <h2 className="panel__title">Transit Corridors</h2>

      <div className="list-card">
        {transitCorridors.map((corridor) => (
          <CorridorItem key={corridor.id} corridor={corridor} />
        ))}
      </div>
    </section>
  );
}
