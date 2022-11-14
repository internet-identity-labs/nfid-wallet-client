// import {} from "@craco/craco"
import path from "path"
import ModuleScopePlugin from "react-dev-utils/ModuleScopePlugin"
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin"
import webpack from "webpack"

import { serviceConfig } from "../../config/canister-env"
import dfxJson from "../../dfx.json"

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
    configure: (config: any, { env, paths }: any) => {
      config.resolve.plugins = config.resolve.plugins.filter(
        (plugin: any) => !(plugin instanceof ModuleScopePlugin),
      )
      const canisterEnv = {
        ...(isExampleBuild ? {} : serviceConfig),
      }
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
