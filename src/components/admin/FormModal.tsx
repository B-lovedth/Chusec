"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type FormModalProps = {
  title: string;
  description?: string;
  submitLabel: string;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
};

/** Shared shell for the command centre's create forms. */
export function FormModal({
  title,
  description,
  submitLabel,
  isSubmitting,
  error,
  onClose,
  onSubmit,
  children,
}: FormModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, isSubmitting]);

  return (
    <div
      className="choice-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="form-modal">
        <div className="form-modal__head">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Close">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form
          className="form-modal__body"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          {children}

          {error && (
            <div className="auth-status auth-status--error" role="alert">
              {error}
            </div>
          )}

          <div className="form-modal__actions">
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
            <button type="button" className="btn btn--outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
