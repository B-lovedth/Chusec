"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type ConfirmBackupModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
};

export function ConfirmBackupModal({ onCancel, onConfirm, isSubmitting }: ConfirmBackupModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onCancel();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onCancel, isSubmitting]);

  return (
    <div
      className="choice-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-backup-heading"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onCancel();
      }}
    >
      <div className="confirm-modal confirm-modal--backup">
        <div className="confirm-modal__head">
          <h2 className="confirm-modal__title" id="confirm-backup-heading">
            Request Backup
          </h2>
          <button
            type="button"
            className="choice-modal__close"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <p className="confirm-modal__text">
          Are you sure you want to request backup? A backup request will be sent to your team for
          assistance.
        </p>


        <div className="confirm-modal__actions confirm-modal__actions--split">
          <button
            type="button"
            className="btn btn--outline btn--danger-outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Requesting..." : "Yes, request backup"}
          </button>
        </div>
      </div>
    </div>
  );
}
