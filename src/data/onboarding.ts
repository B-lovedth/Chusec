export type SlideTone = "critical" | "high" | "medium" | "low";

export type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  art: {
    primary: { label: string; tone: SlideTone };
    secondary: { label: string; tone: SlideTone };
  };
};

/**
 * Placeholder copy — swap for the final marketing copy when it lands.
 * Drives both the desktop signup carousel and the mobile onboarding flow.
 */
export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "community-safety",
    title: "Community Safety",
    description:
      "Live, crowd-sourced incident reports from thousands of Nigerians on the road. Warri. Asaba. Benin City. Every corridor, every minute.",
    art: {
      primary: { label: "Danger", tone: "critical" },
      secondary: { label: "Kidnapping", tone: "high" },
    },
  },
  {
    id: "corridor-alerts",
    title: "Corridor Alerts",
    description:
      "Know which stretch of road has gone hot before you get there. Corridors are graded from critical to low and refresh as new reports come in.",
    art: {
      primary: { label: "Critical", tone: "critical" },
      secondary: { label: "Checkpoint", tone: "medium" },
    },
  },
  {
    id: "report-fast",
    title: "Report In Seconds",
    description:
      "Pick an incident type, capture what you saw and send it. Your GPS is attached automatically and you can always report anonymously.",
    art: {
      primary: { label: "Robbery", tone: "critical" },
      secondary: { label: "Reported", tone: "low" },
    },
  },
  {
    id: "sos",
    title: "Help When It Counts",
    description:
      "One press on SOS shares your live location with emergency units and command operators until you tell us you are safe.",
    art: {
      primary: { label: "SOS", tone: "critical" },
      secondary: { label: "Responding", tone: "low" },
    },
  },
];
