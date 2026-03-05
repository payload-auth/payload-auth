import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/better-auth": path.resolve(__dirname, "./src/better-auth")
    }
  },

  test: {
    globals: true,
    testTimeout: 30000,
    hookTimeout: 60000,
    pool: "forks",
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "dist"]
  }
});
