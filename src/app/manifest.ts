import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chusec — Community Safety",
    short_name: "Chusec",
    description:
      "Live transit corridor alerts, incident reporting and emergency SOS for Nigerian roads.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0080ff",
    categories: ["safety", "navigation", "utilities"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Report an incident", url: "/report" },
      { name: "Alerts", url: "/alerts" },
    ],
  };
}
