export type SlideTone = "critical" | "high" | "medium" | "low";

export type SlideArtId = "corridor" | "panic" | "alerts" | "anonymous";

export type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  art: SlideArtId;
  /** Callout labels, used by the corridor artwork only. */
  callouts?: {
    primary: { label: string; tone: SlideTone };
    secondary: { label: string; tone: SlideTone };
  };
};

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "community-safety",
    title: "Community Safety",
    description:
      "Live, crowd-sourced incident reports from thousands of Nigerians on the road. Warri. Asaba. Benin City. Every corridor, every minute.",
    art: "corridor",
    callouts: {
      primary: { label: "Danger", tone: "critical" },
      secondary: { label: "Kidnapping", tone: "high" },
    },
  },
  {
    id: "panic-button",
    title: "Panic Button",
    description:
      "The SOS button transmits your GPS coordinates directly to the government command centre and nearest security forces — even on 2G.",
    art: "panic",
  },
  {
    id: "real-time-alerts",
    title: "Real-time Alerts",
    description:
      "Push alerts for the Benin–Auchi and Warri–Asaba high-alert corridors. Know the severity level before your journey starts.",
    art: "alerts",
  },
  {
    id: "stay-anonymous",
    title: "Stay Anonymous",
    description:
      "Incident reports are anonymised end-to-end. Your phone ID is hashed and never stored. Speak up without fear.",
    art: "anonymous",
  },
];
