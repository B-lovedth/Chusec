import type { ReactNode } from "react";
import Image from "next/image";
import { Monitor } from "lucide-react";

/**
 * The command centre is a three-column console that has no mobile design, so
 * small screens get a notice instead. Done with CSS rather than a viewport
 * check so there is no hydration mismatch or flash of the wrong branch.
 */
export function DesktopOnly({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="desktop-gate">
        <Image src="/logo.png" alt="Chusec" width={103} height={40} className="desktop-gate__logo" />

        <span className="desktop-gate__icon" aria-hidden="true">
          <Monitor size={30} strokeWidth={1.7} />
        </span>

        <h1 className="desktop-gate__title">Desktop required</h1>
        <p className="desktop-gate__text">
          The command centre needs a wider screen than this device provides. Open Chusec on a desktop or
          laptop to reach the dashboard, unit register and user access.
        </p>
      </div>

      <div className="desktop-gate__content">{children}</div>
    </>
  );
}
