import { solidPlugin } from "esbuild-plugin-solid"
import { type Options, defineConfig } from "tsup"

function generateConfig(jsx: boolean): Options {
  return {
    target: "esnext",
    platform: "browser",
    format: "esm",
    clean: true,
    dts: !jsx,
    entry: ["src/index.ts"],
    outDir: "dist/",
    treeshake: { preset: "smallest" },
    sourcemap: true,
    replaceNodeEnv: true,
    esbuildOptions(options) {
      if (jsx) {
        options.jsx = "preserve"
        options.jsxImportSource = "@solidjs/web"
      }
      options.chunkNames = "[name]/[hash]"
      options.drop = ["console", "debugger"]
    },
    outExtension() {
      return jsx ? { js: ".jsx" } : {}
    },
    // NOTE: this must be `esbuildPlugins`, not `plugins` (tsup's own plugin
    // hook system) — the latter is silently ignored, which previously left
    // the "dom" build un-transformed by Solid's babel preset entirely.
    esbuildPlugins: !jsx ? [solidPlugin({ solid: { generate: "dom" } })] : []
  }
}

export default defineConfig([generateConfig(false), generateConfig(true)])
