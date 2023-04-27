/// <reference types="vitest" />
import NodeGlobalsPolyfillPlugin from "@esbuild-plugins/node-globals-polyfill"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import svgrPlugin from "vite-plugin-svgr"
import viteTsConfigPaths from "vite-tsconfig-paths"

import { serviceConfig } from "../../config/webpack-env"
import dfxJson from "../../dfx.json"

const isExampleBuild = process.env.EXAMPLE_BUILD === "1"

const DFX_PORT = dfxJson.networks.local.bind.split(":")[1]

export default defineConfig({
  cacheDir: "../../node_modules/.vite/nfid-frontend",

  server: {
    port: 9090,
    host: "localhost",
    open: false,
    proxy: {
      // This proxies all http requests made to /api to our running dfx instance
      "/api": {
        target: `http://0.0.0.0:${DFX_PORT}`,
      },
      "/verify": {
        target: process.env.AWS_VERIFY_PHONENUMBER,
        secure: true,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/verify/, ""),
      },
      "/signin": {
        target: process.env.AWS_SIGNIN_GOOGLE,
        secure: true,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/signin/, ""),
      },
      "/symmetric": {
        target: process.env.AWS_SYMMETRIC,
        secure: true,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/symmetric/, ""),
      },
      "/auth": {
        target: process.env.AWS_AUTH_STATS,
        secure: true,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/auth/, ""),
      },
      "/signature": {
        target: process.env.AWS_SIGNATURE_EVENT,
        secure: true,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/signature/, ""),
      },
      "/ecdsa_register": {
        target: process.env.AWS_ECDSA_REGISTER,
        secure: true,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/ecdsa_register/, ""),
      },
      "/ecdsa_sign": {
        target: process.env.AWS_ECDSA_SIGN,
        secure: true,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/ecdsa_sign/, ""),
      },
    },
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
  define: {
    "process.env": process.env,
    global: {},
    ...(isExampleBuild ? {} : serviceConfig),
  },
  resolve: {
    alias: {
      assert: require.resolve("assert"),
      buffer: require.resolve("buffer"),
      events: require.resolve("events"),
      stream: require.resolve("stream-browserify"),
      util: require.resolve("util"),
      https: require.resolve("https-browserify"),
      http: require.resolve("stream-http"),
      crypto: require.resolve("crypto-browserify"),
      path: require.resolve("path-browserify"),
      os: require.resolve("os-browserify/browser"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
})
