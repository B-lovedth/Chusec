"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type SubmitChoiceModalProps = {
  onClose: () => void;
  onSubmit: (anonymous: boolean) => void;
  isSubmitting: boolean;
};

/** Phone-only chooser behind the single Submit button. */
export function SubmitChoiceModal({ onClose, onSubmit, isSubmitting }: SubmitChoiceModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="choice-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Choose how to submit"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="choice-modal">
        <button type="button" className="choice-modal__close" onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={2} />
        </button>

        <button
          type="button"
          className="btn btn--primary choice-modal__option"
          onClick={() => onSubmit(false)}
          disabled={isSubmitting}
        >
          Submit report
        </button>

        <button
          type="button"
          className="btn btn--outline choice-modal__option"
          onClick={() => onSubmit(true)}
          disabled={isSubmitting}
        >
          Submit report anonymous
        </button>
      </div>
    </div>
  );
}
