import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      environmentOptions: {
        jsdom: { url: "http://localhost/" },
      },
      globals: true,
      setupFiles: ["./tests/setup.ts"],
      include: ["tests/unit/**/*.test.{ts,tsx}"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["src/main.tsx", "src/components/ui/**"],
        thresholds: {
          lines: 80,
          functions: 80,
        },
      },
    },
  }),
);
