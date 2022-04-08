// import {} from "@craco/craco"
import { config as loadEnv } from "dotenv"
import path from "path"
import { IgnorePlugin, ProvidePlugin, DefinePlugin } from "webpack"

import dfxJson from "./dfx.json"

loadEnv({ path: path.resolve(__dirname, ".env.local") })

const caniserEnv = [
  "INTERNET_IDENTITY_CANISTER_ID",
  "IDENTITY_MANAGER_CANISTER_ID",
  "PUB_SUB_CHANNEL_CANISTER_ID",
].reduce(
  (acc, key) => ({
    ...acc,
    [`process.env.${key}`]: JSON.stringify(process.env[key]),
  }),
  {},
)

console.log(">> ", { caniserEnv })

// Gets the port dfx is running on from dfx.json
const DFX_PORT = dfxJson.networks.local.bind.split(":")[1]

const config = {
  webpack: {
    alias: {
      frontend: path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig: any, { env, paths }: any) => {
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
    plugins: [
      new DefinePlugin(caniserEnv),
      new ProvidePlugin({
        Buffer: [require.resolve("buffer/"), "Buffer"],
        process: require.resolve("process/browser"),
      }),
      new IgnorePlugin({
        contextRegExp: /^\.\/wordlists\/(?!english)/,
        resourceRegExp: /bip39\/src$/,
      }),
    ],
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
