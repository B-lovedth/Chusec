import type { ReactNode } from "react";
import { ListSkeleton } from "@/components/ui/ListSkeleton";

type ListStateProps = {
  status: "loading" | "ready" | "error";
  error: string;
  isEmpty: boolean;
  emptyMessage: string;
  skeletonRows?: number;
  children: ReactNode;
};

/** Shared loading / error / empty handling for the API-backed lists. */
export function ListState({
  status,
  error,
  isEmpty,
  emptyMessage,
  skeletonRows = 3,
  children,
}: ListStateProps) {
  if (status === "loading") return <ListSkeleton rows={skeletonRows} />;

  if (status === "error") {
    return (
      <p className="list-message list-message--error" role="alert">
        {error}
      </p>
    );
  }

  if (isEmpty) return <p className="list-message">{emptyMessage}</p>;

  return <>{children}</>;
}
