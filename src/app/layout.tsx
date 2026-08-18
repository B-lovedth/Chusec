import type { Metadata, Viewport } from "next";
import { Inclusive_Sans } from "next/font/google";
import { GlobalChrome } from "@/components/layout/GlobalChrome";
import { ServiceWorker } from "@/components/layout/ServiceWorker";
import "@/styles/global.scss";
import "@/styles/auth.scss";
import "@/styles/app.scss";
import "@/styles/dashboard.scss";
import "@/styles/alerts.scss";
import "@/styles/report.scss";
import "@/styles/profile.scss";
import "@/styles/sos.scss";
import "@/styles/admin.scss";
import "@/styles/unit.scss";
import "@/styles/settings.scss";

const inclusiveSans = Inclusive_Sans({
  variable: "--font-inclusive-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chusec | Community Safety",
  description: "Community safety reporting platform for Nigerian transit corridors",
  applicationName: "Chusec",
  appleWebApp: { capable: true, title: "Chusec", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0080ff",
  width: "device-width",
  initialScale: 1,
  // Installed safety app: keep the layout stable, but never block zoom.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inclusiveSans.variable}>
      <body>
        <ServiceWorker />
        <GlobalChrome>{children}</GlobalChrome>
      </body>
    </html>
  );
}
