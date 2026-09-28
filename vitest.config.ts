import solidPlugin from "@solidjs/vite-plugin"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    solidPlugin({
      hot: false,
      solid: {
        generate: "dom",
        omitNestedClosingTags: false,
        moduleName: "@solidjs/web",
      },
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["@testing-library/jest-dom/vitest", "./test-setup.ts"],
    isolate: false,
  },
  resolve: {
    conditions: ["development", "browser"],
    dedupe: ["solid-js"],
  },
  ssr: {
    noExternal: true,
  },
})
