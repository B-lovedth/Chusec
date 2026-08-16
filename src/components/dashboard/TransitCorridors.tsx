"use client";

import { transitCorridors } from "@/data/dashboard";
import { loadTransitCorridors } from "@/data/loaders";
import { useApiList } from "@/hooks/useApiList";
import { CorridorItem } from "@/components/dashboard/CorridorItem";
import { ListSkeleton } from "@/components/ui/ListSkeleton";

export function TransitCorridors() {
  const { status, items } = useApiList(loadTransitCorridors, transitCorridors);

  return (
    <section className="panel">
      <h2 className="panel__title">Transit Corridors</h2>

      <div className="list-card">
        {status === "loading" ? (
          <ListSkeleton rows={4} />
        ) : (
          items.map((corridor) => <CorridorItem key={corridor.id} corridor={corridor} />)
        )}
      </div>
    </section>
  );
}
