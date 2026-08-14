"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

type TextFieldProps = {
  label: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
  /** Renders the eye toggle and flips the input between text and password. */
  revealable?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function TextField({
  label,
  icon,
  hint,
  error,
  revealable = false,
  required,
  id,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [revealed, setRevealed] = useState(false);

  const controlClasses = ["control"];
  if (error) controlClasses.push("control--invalid");
  if (inputProps.disabled) controlClasses.push("control--disabled");

  return (
    <div className="field">
      <label className="field__label" htmlFor={fieldId}>
        {label} {required && <span className="required">*</span>}
      </label>

      <div className={controlClasses.join(" ")}>
        {icon && (
          <span className="control__icon" aria-hidden="true">
            {icon}
          </span>
        )}

        <input
          {...inputProps}
          id={fieldId}
          required={required}
          type={revealable ? (revealed ? "text" : "password") : inputProps.type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${fieldId}-help` : undefined}
        />

        {revealable && (
          <button
            type="button"
            className="control__toggle"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          >
            {revealed ? <EyeOff size={17} strokeWidth={1.8} /> : <Eye size={17} strokeWidth={1.8} />}
          </button>
        )}
      </div>

      {error ? (
        <span className="field__error" id={`${fieldId}-help`}>
          {error}
        </span>
      ) : (
        hint && (
          <span className="field__hint" id={`${fieldId}-help`}>
            {hint}
          </span>
        )
      )}
    </div>
  );
}
