import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\/?tests\/(.*)$/, replacement: path.resolve(__dirname, "./tests/$1") },
      { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, "./src/$1") },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/integration/setup.ts"],
    env: {
      VITE_PROJECT_URL_SUPABASE: "https://test.supabase.co",
      VITE_SUPABASE_API_KEY: "test-key",
    },
  },
});
