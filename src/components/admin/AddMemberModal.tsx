"use client";

import { useState } from "react";
import { FormModal } from "@/components/admin/FormModal";
import { TextField } from "@/components/ui/TextField";
import { createMember } from "@/services/dashboard.service";
import { isValidEmail } from "@/lib/validation";

const ROLES = ["operator", "analyst", "admin"];

type AddMemberModalProps = {
  onClose: () => void;
  onCreated: () => void;
};

export function AddMemberModal({ onClose, onCreated }: AddMemberModalProps) {
  const [form, setForm] = useState({ name: "", email: "", role: "operator" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isValidEmail(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      // Password is omitted: the API generates one and emails the invitation.
      await createMember({ email: form.email.trim(), name: form.name.trim() || null, role: form.role });
      onCreated();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not add that member.");
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      title="Add new member"
      description="They receive an email invitation with a generated password."
      submitLabel="Add member"
      isSubmitting={isSubmitting}
      error={error}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <TextField
        label="Full name"
        name="name"
        value={form.name}
        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
        placeholder="Noah Useghan"
        disabled={isSubmitting}
      />

      <TextField
        label="Email address"
        name="email"
        type="email"
        required
        value={form.email}
        onChange={(event) => {
          setForm((current) => ({ ...current, email: event.target.value }));
          setError("");
        }}
        placeholder="n.useghan@example.com"
        disabled={isSubmitting}
      />

      <label className="field">
        <span className="field__label">Role</span>
        <span className="control">
          <select
            className="control__select"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            disabled={isSubmitting}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role[0].toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </span>
      </label>
    </FormModal>
  );
}
