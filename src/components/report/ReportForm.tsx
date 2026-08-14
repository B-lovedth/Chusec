"use client";

import { useRef, useState } from "react";
import { Camera, MapPin, Mic } from "lucide-react";
import { incidentTypes, type IncidentType } from "@/data/report";
import { currentUser } from "@/data/dashboard";

export function ReportForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [incidentType, setIncidentType] = useState<IncidentType>(incidentTypes[0]);
  const [location, setLocation] = useState(currentUser.location);
  const [description, setDescription] = useState("");
  const [evidenceName, setEvidenceName] = useState("");
  const [submitted, setSubmitted] = useState("");

  // Mock submit — swap for reportIncident() once the API is live.
  const submit = (anonymous: boolean) => {
    setSubmitted(anonymous ? "Anonymous report submitted." : "Report submitted.");
  };

  return (
    <section className="panel">
      <form
        className="report-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit(false);
        }}
      >
        <div>
          <span className="report-label">Incident Type</span>
          <div className="chip-row" role="radiogroup" aria-label="Incident type">
            {incidentTypes.map((type) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={incidentType === type}
                className={incidentType === type ? "chip is-active" : "chip"}
                onClick={() => setIncidentType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="report-label">Capture Evidence</span>
          <button type="button" className="dropzone" onClick={() => fileInputRef.current?.click()}>
            <Camera size={38} strokeWidth={1.4} />
            {evidenceName && <span className="dropzone__caption">{evidenceName}</span>}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            onChange={(event) => setEvidenceName(event.target.files?.[0]?.name ?? "")}
          />
        </div>

        <div>
          <label className="report-label" htmlFor="report-location">
            Location of the incident
          </label>
          <div className="control">
            <span className="control__icon" aria-hidden="true">
              <MapPin size={17} strokeWidth={1.8} />
            </span>
            <input
              id="report-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Warri"
            />
          </div>
        </div>

        <div>
          <label className="report-label" htmlFor="report-description">
            Description
          </label>
          <div className="textarea-wrap">
            <textarea
              id="report-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What did you see? include vehicle descriptions, number of persons, weapon..."
            />
            <button type="button" className="textarea-wrap__mic" aria-label="Dictate description">
              <Mic size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {submitted && (
          <div className="auth-status auth-status--success" role="status">
            {submitted}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn--primary">
            Submit report
          </button>
          <button type="button" className="btn btn--outline" onClick={() => submit(true)}>
            Submit report anonymous
          </button>
        </div>
      </form>
    </section>
  );
}
