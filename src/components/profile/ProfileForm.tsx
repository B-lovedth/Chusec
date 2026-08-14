"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { SquarePen } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { currentUser } from "@/data/dashboard";

const NIN_LENGTH = 11;

type ProfileState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  emergencyContact: string;
  nin: string[];
};

function toProfileState(): ProfileState {
  return {
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    phoneNumber: currentUser.phoneNumber,
    emergencyContact: currentUser.emergencyContact,
    nin: currentUser.nin.padEnd(NIN_LENGTH, " ").slice(0, NIN_LENGTH).split("").map((c) => c.trim()),
  };
}

export function ProfileForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState<ProfileState>(toProfileState);
  const [draft, setDraft] = useState<ProfileState>(saved);
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
    setIsEditing(true);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock save — swap for updateUserProfile() once the API is live.
    setSaved(draft);
    setIsEditing(false);
  };

  const values = isEditing ? draft : saved;

  return (
    <>
      <section className="profile-identity">
        <Image
          className="profile-identity__avatar"
          src={currentUser.avatar}
          alt=""
          width={120}
          height={120}
        />

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

        {isEditing && (
          <div className="profile-actions">
            <button type="submit" className="btn btn--primary">
              Save
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
