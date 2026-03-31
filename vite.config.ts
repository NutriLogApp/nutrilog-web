import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

const version = process.env.BUILD_NUMBER ? `build ${process.env.BUILD_NUMBER}` : "dev";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      manifest: {
        name: "MealRiot",
        short_name: "MealRiot",
        description: "Track your nutrition with AI",
        start_url: "/",
        display: "standalone",
        background_color: "#f2f4f7",
        theme_color: "#0d9488",
        icons: [
          { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // Don't precache API calls or large assets
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        // Clean up old SW caches on update
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
});
