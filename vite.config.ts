import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true, // Ensure source maps are enabled
  },
  // Optionally, you can also enable source maps for development
  server: {
    sourcemap: true,
    port: 3000,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/__tests__/setup.ts", // assuming the test folder is in the root of our project
  },
  plugins: [react()],
});
