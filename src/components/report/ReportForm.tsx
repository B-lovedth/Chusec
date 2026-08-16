"use client";

import { useRef, useState } from "react";
import { Camera, MapPin, Mic } from "lucide-react";
import { incidentTypes, severityLevels, type IncidentType } from "@/data/report";
import { SubmitChoiceModal } from "@/components/report/SubmitChoiceModal";
import { submitReport, uploadEvidence } from "@/services/incidents.service";
import { getCurrentCoordinates, toApiPoint } from "@/lib/geolocation";
import { isAuthenticated } from "@/lib/session";
import { currentUser, type Severity } from "@/data/dashboard";

type Status = { type: "success" | "error"; message: string } | null;

type ReportFormProps = {
  isAnonymous: boolean;
  onAnonymousChange: (anonymous: boolean) => void;
};

export function ReportForm({ isAnonymous, onAnonymousChange }: ReportFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [incidentType, setIncidentType] = useState<IncidentType>(incidentTypes[0]);
  const [severity, setSeverity] = useState<Severity>("High");
  const [location, setLocation] = useState(currentUser.location);
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);

  const submit = async (anonymous: boolean) => {
    setIsChoosing(false);
    onAnonymousChange(anonymous);
    setStatus(null);
    setIsSubmitting(true);

    try {
      const coordinates = await getCurrentCoordinates();
      const point = toApiPoint(coordinates);

      // The API has no location or severity field, so both ride in the note.
      const note = [
        description.trim(),
        `Severity: ${severity}`,
        location.trim() ? `Location: ${location.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const report = await submitReport({
        incident_type: incidentType,
        note,
        x: point.x,
        y: point.y,
      });

      // Evidence upload needs a session, so it is skipped for anonymous reports.
      if (evidence && !anonymous && isAuthenticated()) {
        await uploadEvidence(evidence, String(report.id));
      }

      const skippedEvidence = evidence && (anonymous || !isAuthenticated());
      setStatus({
        type: "success",
        message: skippedEvidence
          ? `${anonymous ? "Anonymous report" : "Report"} submitted. Evidence was not attached — that requires a signed-in report.`
          : `${anonymous ? "Anonymous report" : "Report"} submitted.`,
      });

      setDescription("");
      setEvidence(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not submit the report.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel panel--plain-mobile">
      <form
        className="report-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit(isAnonymous);
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

        <div className="report-severity">
          <span className="report-label">Severity</span>
          <div className="chip-row chip-row--quarters" role="radiogroup" aria-label="Severity">
            {severityLevels.map((level) => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={severity === level}
                className={severity === level ? "chip is-active" : "chip"}
                onClick={() => setSeverity(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="report-label">Capture evidence</span>
          <button type="button" className="dropzone" onClick={() => fileInputRef.current?.click()}>
            <Camera size={38} strokeWidth={1.4} />
            {evidence && <span className="dropzone__caption">{evidence.name}</span>}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            onChange={(event) => setEvidence(event.target.files?.[0] ?? null)}
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

        {status && (
          <div className={`auth-status auth-status--${status.type}`} role="status">
            {status.message}
          </div>
        )}

        {/* Desktop shows both actions inline; phones use the chooser below. */}
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit report"}
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => submit(true)}
            disabled={isSubmitting}
          >
            Submit report anonymous
          </button>
        </div>

        <button
          type="button"
          className="btn btn--primary report-submit-mobile"
          onClick={() => setIsChoosing(true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : isAnonymous ? "Submit anonymous report" : "Submit"}
        </button>
      </form>

      {isChoosing && (
        <SubmitChoiceModal
          onClose={() => setIsChoosing(false)}
          onSubmit={submit}
          isSubmitting={isSubmitting}
        />
      )}
    </section>
  );
}
