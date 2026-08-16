"use client";

import { loadTransitCorridors } from "@/data/loaders";
import { useApiList } from "@/hooks/useApiList";
import { CorridorItem } from "@/components/dashboard/CorridorItem";
import { ListState } from "@/components/ui/ListState";

export function TransitCorridors() {
  const { status, items, error } = useApiList(loadTransitCorridors);

  return (
    <section className="panel">
      <h2 className="panel__title">Transit Corridors</h2>

      <div className="list-card">
        <ListState
          status={status}
          error={error}
          isEmpty={items.length === 0}
          emptyMessage="No corridors are being tracked yet."
          skeletonRows={4}
        >
          {items.map((corridor) => (
            <CorridorItem key={corridor.id} corridor={corridor} />
          ))}
        </ListState>
      </div>
    </section>
  );
}
