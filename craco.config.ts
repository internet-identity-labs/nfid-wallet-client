// import {} from "@craco/craco"
import { config as loadEnv } from "dotenv"
import path from "path"

import dfxJson from "./dfx.json"

const webpack = require("webpack")

loadEnv({ path: path.resolve(__dirname, ".env.local") })

const isExampleBuild = process.env.EXAMPLE_BUILD === "1"

const FRONTEND_ENV = {
  "process.env.NFID_DOMAIN": isExampleBuild
    ? "<NFID_DOMAIN>"
    : process.env.NFID_DOMAIN,
  "process.env.INTERNET_IDENTITY_CANISTER_ID": isExampleBuild
    ? "<INTERNET_IDENTITY_CANISTER_ID>"
    : process.env[
        `INTERNET_IDENTITY_CANISTER_ID_${process.env.REACT_APP_BACKEND_MODE}`
      ],
  "process.env.IDENTITY_MANAGER_CANISTER_ID": isExampleBuild
    ? "<IDENTITY_MANAGER_CANISTER_ID>"
    : process.env[
        `INTERNET_IDENTITY_CANISTER_ID_${process.env.REACT_APP_BACKEND_MODE}`
      ],
  "process.env.PUB_SUB_CHANNEL_CANISTER_ID": isExampleBuild
    ? "<PUB_SUB_CHANNEL_CANISTER_ID>"
    : process.env[
        `PUB_SUB_CHANNEL_CANISTER_ID_${process.env.REACT_APP_BACKEND_MODE}`
      ],
}

// Gets the port dfx is running on from dfx.json
const DFX_PORT = dfxJson.networks.local.bind.split(":")[1]

const config = {
  webpack: {
    alias: {
      frontend: path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig: any, { env, paths }: any) => {
      console.log(">> ", { FRONTEND_ENV })
      webpackConfig.plugins.push(new webpack.DefinePlugin(FRONTEND_ENV))
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
