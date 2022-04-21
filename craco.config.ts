// import {} from "@craco/craco"
import { config as loadEnv } from "dotenv"
import path from "path"

import dfxJson from "./dfx.json"

const webpack = require("webpack")

loadEnv({ path: path.resolve(__dirname, ".env.local") })

const isExampleBuild = process.env.EXAMPLE_BUILD === "1"

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
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          ...(isExampleBuild
            ? {}
            : {
                IC_HOST: JSON.stringify(process.env.REACT_APP_IC_HOST),
                II_ENV: JSON.stringify(process.env.REACT_APP_II_MODE),
                FRONTEND_MODE: JSON.stringify(
                  process.env.REACT_APP_FRONTEND_MODE,
                ),
                INTERNET_IDENTITY_CANISTER_ID: JSON.stringify(
                  process.env[
                    `INTERNET_IDENTITY_CANISTER_ID_${process.env.REACT_APP_BACKEND_MODE}`
                  ],
                ),
                IDENTITY_MANAGER_CANISTER_ID: JSON.stringify(
                  process.env[
                    `IDENTITY_MANAGER_CANISTER_ID_${process.env.REACT_APP_BACKEND_MODE}`
                  ],
                ),
                PUB_SUB_CHANNEL_CANISTER_ID: JSON.stringify(
                  process.env[
                    `PUB_SUB_CHANNEL_CANISTER_ID_${process.env.REACT_APP_BACKEND_MODE}`
                  ],
                ),
              }),
        }),
      )
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
        target: process.env.REACT_APP_AWS_VERIFY_PHONENUMBER,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/verify/, ""),
      },
    },
  },
}
export default config
