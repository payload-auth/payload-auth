import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/shared": resolve(__dirname, "./src/shared"),
      "@/better-auth": resolve(__dirname, "./src/better-auth")
    }
  }
});
