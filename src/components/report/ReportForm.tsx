"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, FileVideo, MapPin, Mic, X } from "lucide-react";
import { incidentTypes, type IncidentType } from "@/data/report";
import { SubmitChoiceModal } from "@/components/report/SubmitChoiceModal";
import { submitReport, uploadEvidence } from "@/services/incidents.service";
import { getCurrentCoordinates, toApiPoint } from "@/lib/geolocation";
import { isAuthenticated } from "@/lib/session";
import { useCitizenData } from "@/components/citizen/CitizenDataProvider";

type Status = { type: "success" | "error"; message: string } | null;

type ReportFormProps = {
  isAnonymous: boolean;
  onAnonymousChange: (anonymous: boolean) => void;
};

export function ReportForm({ isAnonymous, onAnonymousChange }: ReportFormProps) {
  const { city } = useCitizenData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [incidentType, setIncidentType] = useState<IncidentType>(incidentTypes[0]);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const previewUrlRef = useRef("");
  const [status, setStatus] = useState<Status>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);

  // Release the last object URL when the form goes away.
  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  /** Swaps the selection and its preview, freeing the previous object URL. */
  const selectEvidence = (file: File | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    const nextUrl = file && file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
    setEvidence(file);
  };

  const submit = async (anonymous: boolean) => {
    setIsChoosing(false);
    onAnonymousChange(anonymous);
    setStatus(null);
    setIsSubmitting(true);

    try {
      const coordinates = await getCurrentCoordinates();
      const point = toApiPoint(coordinates);

      // The API has no location field, so the typed location rides in the note.
      // Severity is deliberately absent — the command centre grades incidents.
      const note = [description.trim(), location.trim() ? `Location: ${location.trim()}` : ""]
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
      selectEvidence(null);
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

        <div>
          <span className="report-label">Capture evidence</span>

          <div className="dropzone-wrap">
            <button
              type="button"
              className={evidence ? "dropzone has-file" : "dropzone"}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                // Object URL, so next/image would only get in the way.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Selected evidence" className="dropzone__preview" />
              ) : evidence ? (
                <FileVideo size={38} strokeWidth={1.4} />
              ) : (
                <Camera size={38} strokeWidth={1.4} />
              )}
            </button>

            {evidence && (
              <button
                type="button"
                className="dropzone__clear"
                onClick={() => {
                  selectEvidence(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                aria-label="Remove selected evidence"
              >
                <X size={15} strokeWidth={2.2} />
              </button>
            )}
          </div>

          {evidence && (
            <p className="dropzone__filename">
              {evidence.name} · {(evidence.size / 1024).toFixed(0)} KB
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            onChange={(event) => selectEvidence(event.target.files?.[0] ?? null)}
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
              placeholder={city || "Where did it happen?"}
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
