import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { execSync } from "child_process";

let commitHash = process.env.COMMIT_HASH || "unknown";
if (commitHash === "unknown") {
  try {
    commitHash = execSync("git rev-parse --short HEAD").toString().trim();
  } catch { /* git not available in Docker build */ }
}
const buildDate = new Date().toISOString().slice(0, 10);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  define: {
    __APP_VERSION__: JSON.stringify(`${commitHash} · ${buildDate}`),
  },
});
