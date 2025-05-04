import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import path from "path"

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "strapi-blocks-solid-renderer",
      fileName: (format) => `strapi-blocks-solid-renderer.${format}.js`
    },
    rollupOptions: {
      external: ["solid-js", "solid-js/web"],
      output: {
        globals: {
          "solid-js": "solidJs",
          "solid-js/web": "solidJsWeb"
        }
      }
    }
  }
})
