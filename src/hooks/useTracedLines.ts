"use client";

import { useEffect, useMemo, useState } from "react";
import { getDrivingRoute } from "@/services/directions.service";
import type { MapLine } from "@/components/map/MapboxMap";

/** Identifies a line by its endpoints, so a moved unit re-traces. */
function keyOf(line: MapLine) {
  return `${line.id}:${line.coordinates.map((pair) => pair.join()).join("|")}`;
}

/**
 * Replaces each line's straight segments with road geometry.
 *
 * Traced shapes are kept in a lookup and applied during render, so the
 * straight version shows immediately and each line upgrades in place as its
 * route resolves. A failed trace simply keeps the straight line — worse, but
 * never a blank map.
 */
export function useTracedLines(lines: MapLine[]): MapLine[] {
  const [tracedByKey, setTracedByKey] = useState<Record<string, [number, number][]>>({});

  // The input is a fresh array every render; this captures what matters.
  const signature = lines.map(keyOf).join("~");

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      lines.map(async (line) => {
        const route = await getDrivingRoute(line.coordinates);
        return route ? ([keyOf(line), route.coordinates] as const) : null;
      }),
    ).then((results) => {
      if (cancelled) return;

      const resolved = results.filter((entry) => entry !== null);
      if (resolved.length === 0) return;

      setTracedByKey((current) => ({
        ...current,
        ...Object.fromEntries(resolved),
      }));
    });

    return () => {
      cancelled = true;
    };
    // `lines` is deliberately absent: it is a new array identity on every
    // render, and `signature` already covers every value that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return useMemo(
    () =>
      lines.map((line) => {
        const coordinates = tracedByKey[keyOf(line)];
        return coordinates ? { ...line, coordinates } : line;
      }),
    // Same reasoning as above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature, tracedByKey],
  );
}
