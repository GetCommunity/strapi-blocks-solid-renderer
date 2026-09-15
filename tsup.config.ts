import { solidPlugin } from "esbuild-plugin-solid"
import { defineConfig, type Options } from "tsup"

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
    esbuildPlugins: !jsx ? [solidPlugin({ solid: { generate: "dom" } })] : [],
  }
}

export default defineConfig([generateConfig(false), generateConfig(true)])
