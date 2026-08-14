import { activeCorridor } from "@/data/dashboard";

export function ActiveCorridorAlert() {
  return (
    <div className="active-corridor-alert" role="alert">
      <span className="active-corridor-alert__dot" aria-hidden="true" />
      <span className="active-corridor-alert__status">{activeCorridor.status}</span>
      <span className="active-corridor-alert__message">{activeCorridor.message}</span>
    </div>
  );
}
