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
    /**
     * Android will not offer to install without a PNG of at least 192px and
     * one of 512px, declared with explicit sizes — an SVG alone is enough for
     * desktop Chrome but silently fails the mobile install criteria. The SVG
     * is kept last as a scalable extra.
     */
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      { name: "Report an incident", url: "/report" },
      { name: "Alerts", url: "/alerts" },
    ],
  };
}
