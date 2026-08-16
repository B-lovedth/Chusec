"use client";

import { useRef, useState } from "react";
import { SquarePen } from "lucide-react";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { TextField } from "@/components/ui/TextField";
import { updateProfile } from "@/services/auth.service";
import { useUser } from "@/components/auth/RouteGuard";
import { useSession } from "@/components/auth/SessionProvider";
import type { UserProfile } from "@/data/dashboard";

const NIN_LENGTH = 11;

type ProfileDraft = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  emergencyContact: string;
  nin: string[];
};

function toDraft(user: UserProfile): ProfileDraft {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    emergencyContact: user.emergencyContact,
    nin: Array.from({ length: NIN_LENGTH }, (_, index) => user.nin[index] ?? ""),
  };
}

export function ProfileForm() {
  const user = useUser();
  const { refresh } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  // Derived from the loaded profile until the user saves their own edit, so a
  // late-arriving API response is picked up without an effect.
  const [savedOverride, setSavedOverride] = useState<ProfileDraft | null>(null);
  const saved = savedOverride ?? toDraft(user);
  const [draft, setDraft] = useState<ProfileDraft>(saved);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const ninRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleNinChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    setDraft((current) => {
      const nin = [...current.nin];
      nin[index] = digit;
      return { ...current, nin };
    });

    if (digit && index < NIN_LENGTH - 1) ninRefs.current[index + 1]?.focus();
  };

  const handleNinKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !draft.nin[index] && index > 0) {
      ninRefs.current[index - 1]?.focus();
    }
  };

  const startEditing = () => {
    setDraft(saved);
    setStatus(null);
    setIsEditing(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSaving(true);

    try {
      await updateProfile({
        name: `${draft.firstName} ${draft.lastName}`.trim(),
        email: draft.email,
        phone: draft.phoneNumber,
        nin: draft.nin.join(""),
        emergency_contact: draft.emergencyContact,
      });

      setSavedOverride(draft);
      setIsEditing(false);
      setStatus({ type: "success", message: "Profile updated." });
      // Pull the saved profile back through the session so the navbar updates.
      refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not save your profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const values = isEditing ? draft : saved;

  return (
    <>
      <section className="profile-identity">
        <AvatarUploader src={user.avatar} onUploaded={refresh} />

        <div>
          <p className="profile-identity__name">
            {saved.firstName} {saved.lastName}
          </p>
          <p className="profile-identity__email">{saved.email}</p>
        </div>

        <button type="button" className="btn btn--ghost profile-identity__edit" onClick={startEditing}>
          <SquarePen size={15} strokeWidth={1.9} />
          Edit
        </button>
      </section>

      <form className="profile-panel" onSubmit={handleSave}>
        <div className="profile-panel__head">
          <h2>Personal Information</h2>
          <button type="button" className="btn btn--ghost" onClick={startEditing}>
            <SquarePen size={15} strokeWidth={1.9} />
            Edit
          </button>
        </div>

        <div className="profile-grid">
          <TextField
            label="First name"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <TextField
            label="Last name"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <TextField
            label="Email address"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <TextField
            label="Phone number"
            name="phoneNumber"
            type="tel"
            value={values.phoneNumber}
            onChange={handleChange}
            disabled={!isEditing}
          />

          <div className="field">
            <span className="field__label" id="nin-label">
              NIN
            </span>
            <div className="nin-boxes" role="group" aria-labelledby="nin-label">
              {values.nin.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    ninRefs.current[index] = element;
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={!isEditing}
                  aria-label={`NIN digit ${index + 1}`}
                  onChange={(event) => handleNinChange(index, event.target.value)}
                  onKeyDown={(event) => handleNinKeyDown(index, event)}
                />
              ))}
            </div>
          </div>

          <TextField
            label="Emergency contact"
            name="emergencyContact"
            type="tel"
            value={values.emergencyContact}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        {status && (
          <div className={`auth-status auth-status--${status.type} profile-status`} role="status">
            {status.message}
          </div>
        )}

        {isEditing && (
          <div className="profile-actions">
            <button type="submit" className="btn btn--primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn btn--outline" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        )}
      </form>
    </>
  );
}
