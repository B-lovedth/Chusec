"use client";

import { useState } from "react";
import { SquarePen } from "lucide-react";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { TextField } from "@/components/ui/TextField";
import { useUser } from "@/components/auth/RouteGuard";
import { useSession } from "@/components/auth/SessionProvider";
import { updateProfile } from "@/services/auth.service";

type Draft = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export function OperatorProfile() {
  const user = useUser();
  const { role, refresh } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [savedOverride, setSavedOverride] = useState<Draft | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saved = savedOverride ?? {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
  };

  const [draft, setDraft] = useState<Draft>(saved);
  const values = isEditing ? draft : saved;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
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
      });

      setSavedOverride(draft);
      setIsEditing(false);
      setStatus({ type: "success", message: "Profile updated." });
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
          {/* Role comes from the API and is not self-editable. */}
          <TextField label="Role" name="role" value={role} disabled readOnly />
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

      <section className="profile-panel">
        <div className="profile-panel__head">
          <h2>Service &amp; Operational Information</h2>
        </div>

        {/*
          The design shows five service fields, but `UserResponse` carries none
          of them. Rendered read-only rather than faked, so the gap is visible.
        */}
        <p className="profile-note">
          Service records aren&apos;t stored by the API yet — these fields stay empty until the backend
          adds them.
        </p>

        <div className="profile-grid">
          <TextField label="Service Number" name="serviceNumber" value="" disabled readOnly />
          <TextField label="Rank" name="rank" value="" disabled readOnly />
          <TextField label="Unit / Police Post" name="unit" value="" disabled readOnly />
          <TextField label="Years in Service" name="yearsInService" value="" disabled readOnly />
          <TextField label="Direct Supervisor" name="supervisor" value="" disabled readOnly />
        </div>
      </section>
    </>
  );
}
