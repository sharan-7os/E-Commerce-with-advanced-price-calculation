import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",       // ✅ Allows access from any network interface
    port: 5173,            // optional: change if you want
    strictPort: true,      // prevents auto-switching to another port
    proxy: {
      "/api": {
        target: "http://localhost:5000", // ✅ match your Flask backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
