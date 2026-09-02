import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,

    allowedHosts: ["test.inkconvention.com", "localhost", "127.0.0.1"],

    https: {
      key: fs.readFileSync(new URL("./certs/local-key.pem", import.meta.url)),

      cert: fs.readFileSync(new URL("./certs/local-cert.pem", import.meta.url)),
    },

    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
      },

      "/uploads": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
