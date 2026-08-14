import { AuthExperience } from "@/components/auth/AuthExperience";

export default function SignupPage() {
  return (
    <main className="auth-shell auth-shell--signup">
      <section className="auth-hero-panel" aria-label="Community safety panel">
        <div className="auth-hero-graphic" aria-hidden="true">
          <div className="signal-tag signal-tag--left">Danger</div>
          <div className="signal-tag signal-tag--right">Kia</div>
          <div className="graph-grid" />
          <div className="alert-dot" />
          <div className="dashed-line" />
        </div>

        <h2>Community Safety</h2>
        <p>
          Live, crowd-sourced incident reports from thousands of Nigerians on the road. Warri,
          Asaba, Benin City. Every corridor, every minute.
        </p>

        <div className="page-indicator" aria-label="Page indicator">
          <span className="page-indicator__dot" />
          <span className="page-indicator__dot is-active" />
          <span className="page-indicator__dot" />
        </div>
      </section>

      <section className="auth-form-panel">
        <AuthExperience mode="signup" />
      </section>
    </main>
  );
}
