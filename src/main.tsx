import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
/* Self-hosted, subsetted fonts. Only the five faces actually used ship
   with the bundle; everything else is split into separate cacheable
   .woff2 files. */
import "@fontsource/fraunces/latin-400.css";
import "@fontsource/fraunces/latin-400-italic.css";
import "@fontsource/fraunces/latin-700.css";
import "@fontsource/public-sans/latin-400.css";
import "@fontsource/public-sans/latin-600.css";
import "./index.css";
import App from "./App";

const rootEl = document.getElementById("root");
const preloader = document.getElementById("preloader");

createRoot(rootEl!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

/**
 * The preloader is dismissed the moment React has painted the page — NOT on
 * `window.load`. Waiting for `load` meant the spinner covered a perfectly
 * usable page for seconds while large remote photographs finished
 * downloading, which is what made the site feel slow to open.
 *
 * Content below the fold continues to stream in afterwards as normal.
 */
let dismissed = false;
function dismissPreloader() {
  if (dismissed) return;
  dismissed = true;
  preloader?.classList.add("done");
  window.setTimeout(() => preloader?.remove(), 350);
}

// Exposed so App can signal "first paint done" as soon as it mounts.
(window as unknown as { __hidePreloader?: () => void }).__hidePreloader = dismissPreloader;

// Paint happens after the next two animation frames following mount.
requestAnimationFrame(() => requestAnimationFrame(dismissPreloader));

// Safety net for very slow devices or interrupted rendering.
window.setTimeout(dismissPreloader, 2500);
