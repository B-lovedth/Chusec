import type { Metadata } from "next";
import { Inclusive_Sans } from "next/font/google";
import { GlobalChrome } from "@/components/layout/GlobalChrome";
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inclusiveSans.variable}>
      <body>
        <GlobalChrome>{children}</GlobalChrome>
      </body>
    </html>
  );
}
