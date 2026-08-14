import { AuthExperience } from "@/components/auth/AuthExperience";

export default function LoginPage() {
  return (
    <main className="auth-shell auth-shell--login">
      <section className="auth-form-panel auth-form-panel--compact">
        <AuthExperience mode="login" />
      </section>
    </main>
  );
}
