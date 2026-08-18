import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline | Chusec" };

/**
 * Served by the service worker when a navigation fails with no network. Kept
 * deliberately static — it has to render from cache alone.
 */
export default function OfflinePage() {
  return (
    <main className="auth-centered">
      <div className="notice-card">
        <div className="notice-card__icon notice-card__icon--warn">
          <WifiOff size={30} strokeWidth={1.7} />
        </div>

        <h1 className="notice-card__title">You&apos;re offline</h1>
        <p className="notice-card__text">
          Chusec needs a connection to show live incidents and to send reports or an SOS. Reconnect and
          this page will pick up where you left off.
        </p>

        <p className="notice-card__hint">
          In an emergency with no data connection, call your local emergency number directly.
        </p>
      </div>
    </main>
  );
}
