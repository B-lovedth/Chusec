"use client";

import Image from "next/image";
import { useState } from "react";
import { SquarePen } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { commandOperator } from "@/data/admin";

type Draft = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  serviceNumber: string;
  rank: string;
  unit: string;
  yearsInService: string;
  supervisor: string;
};

const initialDraft: Draft = {
  firstName: commandOperator.firstName,
  lastName: commandOperator.lastName,
  email: commandOperator.contactEmail,
  phoneNumber: commandOperator.phoneNumber,
  role: commandOperator.role,
  serviceNumber: commandOperator.serviceNumber,
  rank: commandOperator.rank,
  unit: commandOperator.unit,
  yearsInService: commandOperator.yearsInService,
  supervisor: commandOperator.supervisor,
};

/** `personal` and `service` panels edit independently, as in the design. */
type EditTarget = "none" | "personal" | "service";

export function OperatorProfile() {
  const [editing, setEditing] = useState<EditTarget>("none");
  const [saved, setSaved] = useState<Draft>(initialDraft);
  const [draft, setDraft] = useState<Draft>(initialDraft);

  const values = editing === "none" ? saved : draft;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const startEditing = (target: Exclude<EditTarget, "none">) => {
    setDraft(saved);
    setEditing(target);
  };

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock save — the command profile has no API endpoint yet.
    setSaved(draft);
    setEditing("none");
  };

  return (
    <>
      <section className="profile-identity">
        <Image
          className="profile-identity__avatar"
          src={commandOperator.avatar}
          alt=""
          width={120}
          height={120}
          unoptimized
        />

        <div>
          <p className="profile-identity__name">
            {saved.firstName} {saved.lastName}
          </p>
          <p className="profile-identity__email">{commandOperator.email}</p>
        </div>

        <button
          type="button"
          className="btn btn--ghost profile-identity__edit"
          onClick={() => startEditing("personal")}
        >
          <SquarePen size={15} strokeWidth={1.9} />
          Edit
        </button>
      </section>

      <form className="profile-panel" onSubmit={save}>
        <div className="profile-panel__head">
          <h2>Personal Information</h2>
          <button type="button" className="btn btn--ghost" onClick={() => startEditing("personal")}>
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
            disabled={editing !== "personal"}
          />
          <TextField
            label="Last name"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            disabled={editing !== "personal"}
          />
          <TextField
            label="Email address"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            disabled={editing !== "personal"}
          />
          <TextField
            label="Phone number"
            name="phoneNumber"
            type="tel"
            value={values.phoneNumber}
            onChange={handleChange}
            disabled={editing !== "personal"}
          />
          <TextField
            label="Role"
            name="role"
            value={values.role}
            onChange={handleChange}
            disabled={editing !== "personal"}
          />
        </div>

        {editing === "personal" && (
          <div className="profile-actions">
            <button type="submit" className="btn btn--primary">
              Save
            </button>
            <button type="button" className="btn btn--outline" onClick={() => setEditing("none")}>
              Cancel
            </button>
          </div>
        )}
      </form>

      <form className="profile-panel" onSubmit={save}>
        <div className="profile-panel__head">
          <h2>Service &amp; Operational Information</h2>
          <button type="button" className="btn btn--ghost" onClick={() => startEditing("service")}>
            <SquarePen size={15} strokeWidth={1.9} />
            Edit
          </button>
        </div>

        <div className="profile-grid">
          <TextField
            label="Service Number"
            name="serviceNumber"
            value={values.serviceNumber}
            onChange={handleChange}
            disabled={editing !== "service"}
          />
          <TextField
            label="Rank"
            name="rank"
            value={values.rank}
            onChange={handleChange}
            disabled={editing !== "service"}
          />
          <TextField
            label="Unit / Police Post"
            name="unit"
            value={values.unit}
            onChange={handleChange}
            disabled={editing !== "service"}
          />
          <TextField
            label="Years in Service"
            name="yearsInService"
            value={values.yearsInService}
            onChange={handleChange}
            disabled={editing !== "service"}
          />
          <TextField
            label="Direct Supervisor"
            name="supervisor"
            value={values.supervisor}
            onChange={handleChange}
            disabled={editing !== "service"}
          />
        </div>

        {editing === "service" && (
          <div className="profile-actions">
            <button type="submit" className="btn btn--primary">
              Save
            </button>
            <button type="button" className="btn btn--outline" onClick={() => setEditing("none")}>
              Cancel
            </button>
          </div>
        )}
      </form>
    </>
  );
}
