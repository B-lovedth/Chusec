"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Point = { x: number; y: number };

/** Pointer travel (px) before a press counts as a drag rather than a tap. */
const DRAG_THRESHOLD = 4;
const EDGE_MARGIN = 8;

type DragSession = {
  pointerId: number;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  moved: boolean;
};

function clampToViewport(x: number, y: number, width: number, height: number): Point {
  return {
    x: Math.min(Math.max(x, EDGE_MARGIN), Math.max(EDGE_MARGIN, window.innerWidth - width - EDGE_MARGIN)),
    y: Math.min(Math.max(y, EDGE_MARGIN), Math.max(EDGE_MARGIN, window.innerHeight - height - EDGE_MARGIN)),
  };
}

/**
 * Makes an element draggable by pointer while keeping it clickable: a press
 * that never travels past `DRAG_THRESHOLD` is reported as a tap, so callers
 * can skip their click handler after a real drag.
 */
export function useDraggable<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const sessionRef = useRef<DragSession | null>(null);
  const draggedRef = useRef(false);
  const [position, setPosition] = useState<Point | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Keep the element on screen when the viewport changes size. A
  // ResizeObserver on the root element also catches viewport changes that
  // never fire a window `resize` event (device emulation, virtual keyboards).
  useEffect(() => {
    const clamp = () => {
      const element = ref.current;
      if (!element) return;

      setPosition((current) => {
        if (!current) return current;
        const { width, height } = element.getBoundingClientRect();
        const next = clampToViewport(current.x, current.y, width, height);
        return next.x === current.x && next.y === current.y ? current : next;
      });
    };

    const observer = new ResizeObserver(clamp);
    observer.observe(document.documentElement);
    window.addEventListener("resize", clamp);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", clamp);
    };
  }, []);

  const onPointerDown = useCallback((event: React.PointerEvent<T>) => {
    const element = ref.current;
    if (!element || event.button !== 0) return;

    const rect = element.getBoundingClientRect();
    sessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      moved: false,
    };
    draggedRef.current = false;
    element.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<T>) => {
    const session = sessionRef.current;
    const element = ref.current;
    if (!session || !element || session.pointerId !== event.pointerId) return;

    if (!session.moved) {
      const travel = Math.hypot(event.clientX - session.startX, event.clientY - session.startY);
      if (travel < DRAG_THRESHOLD) return;
      session.moved = true;
      setIsDragging(true);
    }

    const { width, height } = element.getBoundingClientRect();
    setPosition(clampToViewport(event.clientX - session.offsetX, event.clientY - session.offsetY, width, height));
  }, []);

  const endDrag = useCallback((event: React.PointerEvent<T>) => {
    const session = sessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    sessionRef.current = null;
    draggedRef.current = session.moved;
    setIsDragging(false);
    ref.current?.releasePointerCapture(event.pointerId);
  }, []);

  /** True when the click that just fired was the tail of a drag. */
  const consumeDrag = useCallback(() => {
    const dragged = draggedRef.current;
    draggedRef.current = false;
    return dragged;
  }, []);

  return {
    ref,
    position,
    isDragging,
    consumeDrag,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
