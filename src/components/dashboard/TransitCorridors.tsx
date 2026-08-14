import { transitCorridors } from "@/data/dashboard";
import { CorridorItem } from "@/components/dashboard/CorridorItem";

export function TransitCorridors() {
  return (
    <section className="panel-section">
      <div className="section-heading">
        <h3>Transit Corridors</h3>
      </div>

      <div className="corridor-list">
        {transitCorridors.map((corridor) => (
          <CorridorItem key={corridor.id} corridor={corridor} />
        ))}
      </div>
    </section>
  );
}
