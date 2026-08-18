"use client";

import { useState } from "react";
import { FormModal } from "@/components/admin/FormModal";
import { TextField } from "@/components/ui/TextField";
import { createFieldUnit } from "@/services/dashboard.service";
import type { Agency } from "@/data/admin";

const AGENCIES: Agency[] = [
  "Nigeria Police Force",
  "DSS",
  "NSCDC",
  "Immigration",
  "Nigeria Custom",
  "Correctional Service",
  "NDLEA",
  "FRSC",
];

type AddUnitModalProps = {
  onClose: () => void;
  onCreated: () => void;
};

export function AddUnitModal({ onClose, onCreated }: AddUnitModalProps) {
  const [form, setForm] = useState({
    name: "",
    callsign: "",
    agency: "Nigeria Police Force",
    phone: "",
    email: "",
    lga: "",
    address: "",
    responding_unit: "",
    team_lead: "",
    responders: "",
    vehicles: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("The unit needs a station name.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      // Password omitted — the API generates one and emails the credentials.
      await createFieldUnit({
        name: form.name.trim(),
        callsign: form.callsign.trim() || null,
        agency: form.agency,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        lga: form.lga.trim() || null,
        address: form.address.trim() || null,
        responding_unit: form.responding_unit.trim() || null,
        team_lead: form.team_lead.trim() || null,
        // Comma-separated on the wire; the table splits them back out.
        responders: form.responders.trim() || null,
        vehicles: form.vehicles.trim() || null,
      });

      onCreated();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create that unit.");
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      title="Add unit"
      description="Provisions a field unit account and emails its credentials."
      submitLabel="Add unit"
      isSubmitting={isSubmitting}
      error={error}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="form-modal__grid">
        <TextField
          label="Unit / station name"
          name="name"
          required
          value={form.name}
          onChange={set("name")}
          placeholder="Warri South-West Divisional Police"
          disabled={isSubmitting}
        />
        <TextField
          label="Callsign"
          name="callsign"
          value={form.callsign}
          onChange={set("callsign")}
          placeholder="DT-KOK-020"
          disabled={isSubmitting}
        />

        <label className="field">
          <span className="field__label">Agency</span>
          <span className="control">
            <select
              className="control__select"
              value={form.agency}
              onChange={(event) => setForm((current) => ({ ...current, agency: event.target.value }))}
              disabled={isSubmitting}
            >
              {AGENCIES.map((agency) => (
                <option key={agency}>{agency}</option>
              ))}
            </select>
          </span>
        </label>

        <TextField
          label="LGA"
          name="lga"
          value={form.lga}
          onChange={set("lga")}
          placeholder="Warri South-West LGA"
          disabled={isSubmitting}
        />
        <TextField
          label="Address"
          name="address"
          value={form.address}
          onChange={set("address")}
          placeholder="Ogidigben Rd, Koko"
          disabled={isSubmitting}
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          placeholder="08051234098"
          disabled={isSubmitting}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="unit@example.com"
          disabled={isSubmitting}
        />
        <TextField
          label="Responding unit"
          name="responding_unit"
          value={form.responding_unit}
          onChange={set("responding_unit")}
          placeholder="Marine Police Squad"
          disabled={isSubmitting}
        />
        <TextField
          label="Team lead"
          name="team_lead"
          value={form.team_lead}
          onChange={set("team_lead")}
          placeholder="DSP Solomon Akpoviri"
          disabled={isSubmitting}
        />
        <TextField
          label="Responders"
          name="responders"
          value={form.responders}
          onChange={set("responders")}
          placeholder="Sgt. Victor Egberi, Cpl. Nancy Toritseju"
          hint="Separate with commas"
          disabled={isSubmitting}
        />
        <TextField
          label="Vehicles"
          name="vehicles"
          value={form.vehicles}
          onChange={set("vehicles")}
          placeholder="DT-KOK-020, DT-KOK-021 (Boat)"
          hint="Separate with commas"
          disabled={isSubmitting}
        />
      </div>
    </FormModal>
  );
}
