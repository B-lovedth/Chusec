import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalChrome } from "@/components/layout/GlobalChrome";
import "@/styles/global.scss";
import "@/styles/auth.scss";
import "@/styles/dashboard.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chusec | Community Safety",
  description: "Community safety reporting platform signup and login experience",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <GlobalChrome>{children}</GlobalChrome>
      </body>
    </html>
  );
}
