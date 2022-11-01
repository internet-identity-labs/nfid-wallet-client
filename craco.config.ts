// import {} from "@craco/craco"
import { config as loadEnv } from "dotenv"
import path from "path"

import dfxJson from "./dfx.json"
import { serviceConfig } from "./packages/config/src"

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
      const canisterEnv = {
        ...(isExampleBuild ? {} : serviceConfig),
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
