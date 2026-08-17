"use client";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
};

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={checked ? "toggle is-on" : "toggle"}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className="toggle__knob" aria-hidden="true" />
    </button>
  );
}
