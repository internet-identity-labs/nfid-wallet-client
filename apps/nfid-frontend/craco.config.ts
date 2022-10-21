// import {} from "@craco/craco"
import { config as loadEnv } from "dotenv"
import path from "path"
import ModuleScopePlugin from "react-dev-utils/ModuleScopePlugin"
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin"

import dfxJson from "./dfx.json"

const webpack = require("webpack")

loadEnv({ path: path.resolve(__dirname, ".env.local") })

const isExampleBuild = process.env.EXAMPLE_BUILD === "1"

let sentryRelease = require("child_process")
  .execSync("git rev-parse HEAD")
  .toString()
  .trim()
  .slice(0, 12)

// Gets the port dfx is running on from dfx.json
const DFX_PORT = dfxJson.networks.local.bind.split(":")[1]

const config = {
  webpack: {
    alias: {
      frontend: path.resolve(__dirname, "src"),
    },
    optimization: {
      minimize: !isExampleBuild,
    },
    configure: (config: any, { env, paths }: any) => {
      const canisterEnv = {
        ...(isExampleBuild
          ? {}
          : {
              SENTRY_RELEASE: JSON.stringify(sentryRelease),
              IS_E2E_TEST: JSON.stringify(process.env.IS_E2E_TEST),
              IC_HOST: JSON.stringify(process.env.IC_HOST),
              II_ENV: JSON.stringify(process.env.II_MODE),
              CURRCONV_TOKEN: JSON.stringify(process.env.CURRCONV_TOKEN),
              FRONTEND_MODE: JSON.stringify(process.env.FRONTEND_MODE),
              IS_DEV: JSON.stringify(process.env.IS_DEV),
              USERGEEK_API_KEY: JSON.stringify(process.env.USERGEEK_API_KEY),
              GOOGLE_CLIENT_ID: JSON.stringify(process.env.GOOGLE_CLIENT_ID),
              LEDGER_CANISTER_ID: JSON.stringify(
                process.env.LEDGER_CANISTER_ID,
              ),
              CYCLES_MINTER_CANISTER_ID: JSON.stringify(
                process.env.CYCLES_MINTER_CANISTER_ID,
              ),
              VERIFY_PHONE_NUMBER: JSON.stringify(
                process.env.FRONTEND_MODE === "production"
                  ? process.env.AWS_VERIFY_PHONENUMBER
                  : "/verify",
              ),
              AWS_SYMMETRIC: JSON.stringify(process.env.AWS_SYMMETRIC),
              SIGNIN_GOOGLE: JSON.stringify(
                process.env.FRONTEND_MODE === "production"
                  ? process.env.AWS_SIGNIN_GOOGLE
                  : "/signin",
              ),
              INTERNET_IDENTITY_CANISTER_ID: JSON.stringify(
                process.env[
                  `INTERNET_IDENTITY_CANISTER_ID_${process.env.BACKEND_MODE}`
                ],
              ),
              IDENTITY_MANAGER_CANISTER_ID: JSON.stringify(
                process.env[
                  `IDENTITY_MANAGER_CANISTER_ID_${process.env.BACKEND_MODE}`
                ],
              ),
              PUB_SUB_CHANNEL_CANISTER_ID: JSON.stringify(
                process.env[
                  `PUB_SUB_CHANNEL_CANISTER_ID_${process.env.BACKEND_MODE}`
                ],
              ),
              VERIFIER_CANISTER_ID: JSON.stringify(
                process.env[`VERIFIER_CANISTER_ID_${process.env.BACKEND_MODE}`],
              ),
            }),
      }
      config.plugins.push(new webpack.DefinePlugin(canisterEnv))
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: [require.resolve("buffer/"), "Buffer"],
          process: require.resolve("process/browser"),
        }),
      )
      config.plugins.push(
        new webpack.IgnorePlugin({
          contextRegExp: /^\.\/wordlists\/(?!english)/,
          resourceRegExp: /bip39\/src$/,
        }),
      )
      // Remove guard against importing modules outside of `src`.
      // Needed for workspace projects.
      config.resolve.plugins = config.resolve.plugins.filter(
        (plugin: any) => !(plugin instanceof ModuleScopePlugin),
      )
      // Add support for importing workspace projects.
      config.resolve.plugins.push(
        new TsConfigPathsPlugin({
          configFile: path.resolve(__dirname, "tsconfig.json"),
          extensions: [".ts", ".tsx", ".js", ".jsx"],
          mainFields: ["module", "main"],
        }),
      )

      // Replace include option for babel loader with exclude
      // so babel will handle workspace projects as well.
      config.module.rules[1].oneOf.forEach((r: any) => {
        if (r.loader && r.loader.indexOf("babel") !== -1) {
          r.exclude = /node_modules/
          delete r.include
        }
      })
      return {
        ...config,
        // module: {
        //   rules: [
        //     {
        //       test: /\.tsx$/,
        //       enforce: "pre",
        //       use: ["source-map-loader"],
        //     },
        //   ],
        // },
        devtool: process.env.FRONTEND_MODE !== "production" && "source-map",
        ignoreWarnings: [/Failed to parse source map from/],
        resolve: {
          ...config.resolve,
          extensions: [".js", ".ts", ".jsx", ".tsx"],
          fallback: {
            ...config.resolve.fallback,
            assert: require.resolve("assert"),
            buffer: require.resolve("buffer"),
            events: require.resolve("events"),
            stream: require.resolve("stream-browserify"),
            util: require.resolve("util"),
          },
        },
      }
    },
  },
  jest: {
    configure: (config: any) => {
      config.resolver = "@nrwl/jest/plugins/resolver"
      return config
    },
    displayName: "nfid-frontend",
    preset: "../../jest.preset.js",
    testMatch: ["**/*.spec.(js|ts|tsx)"],
    transform: {
      "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "@nrwl/react/plugins/jest",
      "^.+\\.[tj]sx?$": ["babel-jest", { presets: ["@nrwl/react/babel"] }],
    },
    collectCoverage: false,
    coverageDirectory: "./coverage",
    coverageThreshold: {
      global: {
        branches: 99,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    collectCoverageFrom: ["src/**/*.ts", "!**/node_modules/**"],
    setupFilesAfterEnv: ["./src/setupTests.ts"],
    roots: ["test/", "src/"],
    moduleDirectories: ["node_modules"],
    moduleNameMapper: {
      "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|did)$":
        "<rootDir>/mocks/fileMock.js",
      "\\.(css|less)$": "<rootDir>/mocks/fileMock.js",
      "^frontend/(.*)$": "<rootDir>/src/$1",
    },
  },
  devServer: {
    open: false,
    port: 9090,
    proxy: {
      // This proxies all http requests made to /api to our running dfx instance
      "/api": {
        target: `http://0.0.0.0:${DFX_PORT}`,
      },
      "/verify": {
        target: process.env.AWS_VERIFY_PHONENUMBER,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/verify/, ""),
      },
      "/signin": {
        target: process.env.AWS_SIGNIN_GOOGLE,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/signin/, ""),
      },
      "/symmetric": {
        target: process.env.AWS_SYMMETRIC,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/symmetric/, ""),
      },
    },
  },
}
export default config
