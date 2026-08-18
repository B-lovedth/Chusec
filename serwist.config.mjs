import { serwist } from "@serwist/next/config";

/**
 * Serwist runs as its own build step rather than as a Next plugin: the plugin
 * injects a webpack config, and Next 16 builds with Turbopack by default.
 * Configurator mode keeps Turbopack and produces the same service worker.
 * Invoked by the `build` script after `next build`.
 */
export default serwist({
  swSrc: "src/app/sw.ts",
  // Must land in `public/` so it is served from `/sw.js`. A worker served from
  // `/_next/static/` would only be allowed to control that path.
  swDest: "public/sw.js",
  globDirectory: ".next",
  globPatterns: ["static/**/*.{js,css,woff,woff2}"],
  // Rewrite the precache URLs from disk paths to the paths Next serves them on.
  modifyURLPrefix: { "static/": "/_next/static/" },
});
