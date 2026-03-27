import { defineConfig } from "tsdown"
import solid from "unplugin-solid/rolldown"

// export default defineConfig({
//   entry: ["src/index.ts"],
//   format: ["esm", "cjs"],
//   dts: true,
//   sourcemap: true,
//   clean: true,
//   treeshake: true
// })

export default defineConfig({
  entry: ["./src/index.ts"],
  platform: "neutral",
  dts: true,
  plugins: [solid()]
})
