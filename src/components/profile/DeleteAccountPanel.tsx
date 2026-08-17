"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert, X } from "lucide-react";
import { deleteAccount } from "@/services/auth.service";
import { useSession } from "@/components/auth/SessionProvider";

/** Typing this exactly is what arms the delete button. */
const CONFIRM_PHRASE = "DELETE";

export function DeleteAccountPanel() {
  const router = useRouter();
  const { signOut } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) setIsOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, isDeleting]);

  const close = () => {
    setIsOpen(false);
    setConfirmation("");
    setError("");
  };

  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);

    try {
      await deleteAccount();
      // Drop the session before navigating, or the guard bounces off a dead token.
      signOut();
      router.replace("/auth/signup");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete your account.");
      setIsDeleting(false);
    }
  };

  return (
    <section className="danger-panel">
      <div className="danger-panel__head">
        <h2>Delete account</h2>
      </div>

      <p className="danger-panel__text">
        Permanently deletes your account and signs you out on every device. This can&apos;t be undone.
      </p>

      <button type="button" className="btn danger-panel__button" onClick={() => setIsOpen(true)}>
        Delete my account
      </button>

      {isOpen && (
        <div
          className="choice-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-heading"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) close();
          }}
        >
          <div className="confirm-modal">
            <button
              type="button"
              className="choice-modal__close"
              onClick={close}
              disabled={isDeleting}
              aria-label="Close"
            >
              <X size={16} strokeWidth={2} />
            </button>

            <span className="confirm-modal__icon" aria-hidden="true">
              <TriangleAlert size={26} strokeWidth={1.8} />
            </span>

            <h2 className="confirm-modal__title" id="delete-account-heading">
              Delete your account?
            </h2>
            <p className="confirm-modal__text">
              Your profile and saved details will be removed permanently. Reports you have already
              submitted stay with the incident record.
            </p>

            <label className="field confirm-modal__field">
              <span className="field__label">
                Type <strong>{CONFIRM_PHRASE}</strong> to confirm
              </span>
              <span className="control">
                <input
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder={CONFIRM_PHRASE}
                  autoComplete="off"
                  disabled={isDeleting}
                  aria-label={`Type ${CONFIRM_PHRASE} to confirm`}
                />
              </span>
            </label>

            {error && (
              <div className="auth-status auth-status--error confirm-modal__error" role="alert">
                {error}
              </div>
            )}

            <div className="confirm-modal__actions">
              <button
                type="button"
                className="btn danger-panel__button"
                onClick={handleDelete}
                disabled={confirmation !== CONFIRM_PHRASE || isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete account"}
              </button>
              <button type="button" className="btn btn--outline" onClick={close} disabled={isDeleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
