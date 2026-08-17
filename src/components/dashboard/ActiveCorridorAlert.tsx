type ActiveCorridorAlertProps = {
  /** Supplied by the citizen dashboard; nothing renders when it is absent. */
  warning: string | null;
};

export function ActiveCorridorAlert({ warning }: ActiveCorridorAlertProps) {
  if (!warning) return null;

  return (
    <div className="corridor-banner" role="alert">
      <span className="corridor-banner__dot" aria-hidden="true" />
      <span>{warning}</span>
    </div>
  );
}
