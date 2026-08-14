import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { GlobalChrome } from "@/components/layout/GlobalChrome";
import "@/styles/global.scss";
import "@/styles/auth.scss";
import "@/styles/app.scss";
import "@/styles/dashboard.scss";
import "@/styles/alerts.scss";
import "@/styles/report.scss";
import "@/styles/profile.scss";
import "@/styles/sos.scss";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chusec | Community Safety",
  description: "Community safety reporting platform for Nigerian transit corridors",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>
        <GlobalChrome>{children}</GlobalChrome>
      </body>
    </html>
  );
}
