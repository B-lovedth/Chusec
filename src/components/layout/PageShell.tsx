import type { ReactNode } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";

type PageShellProps = {
  title: string;
  subtitle?: string;
  /** Location shown in the chip on the right of the page header. */
  location?: string;
  /** Avatar beside the title — rendered on phones only (dashboard uses it). */
  avatar?: string;
  children: ReactNode;
};

export function PageShell({ title, subtitle, location, avatar, children }: PageShellProps) {
  return (
    <main className="page-card">
      <div className="page-head">
        {avatar && (
          <Image className="page-head__avatar" src={avatar} alt="" width={44} height={44} unoptimized />
        )}

        <div className="page-head__text">
          <h1 className="page-head__title">{title}</h1>
          {subtitle && <p className="page-head__subtitle">{subtitle}</p>}
        </div>

        {location && (
          <span className="location-chip" aria-label={`Current location: ${location}`}>
            <MapPin size={15} strokeWidth={2} />
            {location}
          </span>
        )}
      </div>

      {children}
    </main>
  );
}
