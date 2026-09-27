import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import base44Plugin from "@base44/vite-plugin";

export default defineConfig({
  plugins: [react(), base44Plugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: true,
  },
});
