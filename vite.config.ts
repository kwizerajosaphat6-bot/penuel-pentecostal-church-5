import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
// vite-plugin-singlefile inlines JavaScript and CSS by default; we keep
// that behaviour so the HTML shell ships in one request, but we leave
// images and fonts as separate cacheable files so they do not block the
// first paint and can be reused by Cloudflare and the browser.
export default defineConfig({
  build: {
    // 0 = never inline assets as base64 data URIs. We want images and fonts
    // to ship as separate cacheable files so the first paint does not have
    // to wait for the biggest item.
    assetsInlineLimit: 0,
    // Use a hashed filename so Cloudflare can set immutable cache headers.
    assetsDir: "assets",
  },
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile({
      useRecommendedBuildConfig: false,
      inlinePattern: ["**/*.css", "**/*.js"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
