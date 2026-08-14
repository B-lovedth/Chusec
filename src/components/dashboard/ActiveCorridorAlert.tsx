import { activeCorridor } from "@/data/dashboard";

export function ActiveCorridorAlert() {
  return (
    <div className="corridor-banner" role="alert">
      <span className="corridor-banner__dot" aria-hidden="true" />
      <span>
        {activeCorridor.status} — {activeCorridor.message}
      </span>
    </div>
  );
}
