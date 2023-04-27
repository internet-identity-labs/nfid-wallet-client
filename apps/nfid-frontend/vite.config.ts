/// <reference types="vitest" />
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import svgrPlugin from "vite-plugin-svgr"
import viteTsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  cacheDir: "../../node_modules/.vite/nfid-frontend",

  server: {
    port: 4200,
    host: "localhost",
  },

  preview: {
    port: 4300,
    host: "localhost",
  },

  plugins: [
    react(),
    viteTsConfigPaths({
      root: "../../",
    }),
    svgrPlugin(),
  ],
})
