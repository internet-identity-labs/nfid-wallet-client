import { crx } from "@crxjs/vite-plugin"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import svgr from "vite-plugin-svgr"

// @ts-ignore
import manifest from "./src/manifest"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      frontend: path.resolve(__dirname, "../nfid-frontend/src"),
      "@nfid/config": path.resolve(__dirname, "../../packages/config/src"),
      "@nfid/integration": path.resolve(
        __dirname,
        "../../packages/integration/src",
      ),
      "@nfid-frontend/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "packages/integration": path.resolve(
        __dirname,
        "../../packages/integration",
      ),
      "packages/ui": path.resolve(__dirname, "../../packages/ui"),
      "packages/utils": path.resolve(__dirname, "../../packages/utils"),
      "@nfid-frontend/utils": path.resolve(
        __dirname,
        "../../packages/utils/src",
      ),
      "@nfid/client-db": path.resolve(
        __dirname,
        "../../packages/client-db/src",
      ),
      "@nfid/swr": path.resolve(__dirname, "../../packages/swr/src"),
    },
  },
  build: {
    target: "es2020",
    commonjsOptions: {
      // vite build use @rollup/plugin-commonjs as default, which transforms all the cjs files
      // However Sui Sdk mixed using esm & cjs，therefore should turn on transformMixedEsModules.
      // https://github.com/originjs/vite-plugins/issues/9#issuecomment-924668456
      transformMixedEsModules: true,
    },
    minify: false, // disable minify for chrome review speed,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
      define: {
        global: "globalThis",
      },
    },
  },
  esbuild: {
    pure: mode === "production" ? ["console.log", "console.debug"] : [],
  },
  define: {
    // handle "process is not defined" for importing sui sdk
    // https://github.com/vitejs/vite/issues/1973#issuecomment-787571499
    "process.env": {},
  },
  plugins: [
    svgr(),
    react(),
    crx({ manifest }),
  ],
}))
