import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  },
  build: {
    // Phaser remains isolated behind the lazy runtime import; the explicit budget keeps build warnings actionable.
    chunkSizeWarningLimit: 1300
  }
});
