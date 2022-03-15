import typescript from "@rollup/plugin-typescript"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const { resolve } = require("path")

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      // TODO: add css input/output config
      entry: resolve(__dirname, "src/index.ts"),
      name: "ilui",
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react"],
      output: {
        globals: {
          react: "React",
        },
      },
      plugins: [
        typescript({
          tsconfig: resolve(__dirname, "tsconfig.json"),
          rootDir: resolve("./src"),
          declaration: true,
          declarationDir: resolve("./dist"),
          exclude: resolve("./node_modules/**"),
        }),
      ],
    },
  },
})
