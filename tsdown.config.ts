import { solidPlugin } from "esbuild-plugin-solid"
import type { UserConfig } from "tsdown"
import { defineConfig } from "tsdown"

// export default defineConfig({
//   entry: ["src/index.ts"],
//   format: ["esm", "cjs"],
//   dts: true,
//   sourcemap: true,
//   clean: true,
//   treeshake: true
// })

function generateConfig(jsx: boolean): UserConfig {
  return {
    target: "esnext",
    platform: "browser",
    format: "esm",
    clean: true,
    dts: !jsx,
    entry: ["src/index.ts"],
    outDir: "dist/",
    treeshake: true,
    sourcemap: true,
    plugins: !jsx ? [solidPlugin({ solid: { generate: "dom" } })] : []
  }
}

export default defineConfig([generateConfig(false), generateConfig(true)])
