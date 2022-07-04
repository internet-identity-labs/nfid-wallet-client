// import {} from "@craco/craco"
import { config as loadEnv } from "dotenv"
import path from "path"

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
    configure: (webpackConfig: any, { env, paths }: any) => {
      const canisterEnv = {
        ...(isExampleBuild
          ? {}
          : {
              SENTRY_RELEASE: JSON.stringify(sentryRelease),
              IC_HOST: JSON.stringify(process.env.IC_HOST),
              II_ENV: JSON.stringify(process.env.II_MODE),
              FRONTEND_MODE: JSON.stringify(process.env.FRONTEND_MODE),
              USERGEEK_API_KEY: JSON.stringify(process.env.USERGEEK_API_KEY),
              GOOGLE_CLIENT_ID: JSON.stringify(process.env.GOOGLE_CLIENT_ID),
              VERIFY_PHONE_NUMBER: JSON.stringify(
                process.env.FRONTEND_MODE === "production"
                  ? process.env.AWS_VERIFY_PHONENUMBER
                  : "/verify",
              ),
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
              IM_ADDITION_CANISTER_ID: JSON.stringify(
                process.env[
                  `IM_ADDITION_CANISTER_ID_${process.env.BACKEND_MODE}`
                ],
              ),
            }),
      }

      webpackConfig.plugins.push(new webpack.DefinePlugin(canisterEnv))
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: [require.resolve("buffer/"), "Buffer"],
          process: require.resolve("process/browser"),
        }),
      )
      webpackConfig.plugins.push(
        new webpack.IgnorePlugin({
          contextRegExp: /^\.\/wordlists\/(?!english)/,
          resourceRegExp: /bip39\/src$/,
        }),
      )
      return {
        ...webpackConfig,
        // FIXME: configure source map parser
        // module: {
        //   rules: [
        //     {
        //       test: /\.js$/,
        //       enforce: "pre",
        //       use: ["source-map-loader"],
        //     },
        //   ],
        // },
        ignoreWarnings: [/Failed to parse source map from/],
        resolve: {
          ...webpackConfig.resolve,
          extensions: [".js", ".ts", ".jsx", ".tsx"],
          fallback: {
            ...webpackConfig.resolve.fallback,
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
    },
  },
}
export default config
