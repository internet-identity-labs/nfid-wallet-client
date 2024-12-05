// import {} from "@craco/craco"
import path from "path"
import ModuleScopePlugin from "react-dev-utils/ModuleScopePlugin"
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin"
import webpack from "webpack"

import { serviceConfig } from "../../config/webpack-env"

console.log("nfid-frontend", { serviceConfig })

const isExampleBuild = process.env.EXAMPLE_BUILD === "1"

const config = {
  webpack: {
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
          r.exclude = /node_modules\/(?!(@dfinity\/ledger-icp)\/).*/
          delete r.include
        }
      })

      const isProduction = process.env.FRONTEND_MODE === "production"
      return {
        ...config,
        output: {
          ...config.output,
          crossOriginLoading: "anonymous",
        },
        devtool: !isProduction && "source-map",
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
            https: require.resolve("https-browserify"),
            http: require.resolve("stream-http"),
            crypto: require.resolve("crypto-browserify"),
            path: require.resolve("path-browserify"),
            os: require.resolve("os-browserify/browser"),
            vm: require.resolve("vm-browserify"),
          },
        },
        plugins: [
          ...config.plugins,
          new webpack.DefinePlugin(canisterEnv),
          new webpack.ProvidePlugin({
            Buffer: [require.resolve("buffer/"), "Buffer"],
            process: require.resolve("process/browser"),
          }),
          new webpack.IgnorePlugin({
            contextRegExp: /^\.\/wordlists\/(?!english)/,
            resourceRegExp: /bip39\/src$/,
          }),
          // ...setupCSP(),
        ],
      }
    },
  },
}
export default config
