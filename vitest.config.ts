import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    env: {
      VITE_PROJECT_URL_SUPABASE: "https://test.supabase.co",
      VITE_SUPABASE_API_KEY: "test-key",
    },
  },
});
