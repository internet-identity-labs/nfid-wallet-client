import path from "path"
import ModuleScopePlugin from "react-dev-utils/ModuleScopePlugin"
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin"
import webpack from "webpack"

import { JEST_GLOBALS } from "../../config/jest-globals"
import { serviceConfig } from "../../config/webpack-env"

console.log(">> ", { serviceConfig })

const config = {
  webpack: {
    configure: (config: any) => {
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
        ignoreWarnings: [/Failed to parse source map from/],
        plugins: [
          ...config.plugins,
          new webpack.DefinePlugin(serviceConfig),
          new webpack.ProvidePlugin({
            Buffer: [require.resolve("buffer/"), "Buffer"],
            process: require.resolve("process/browser"),
          }),
        ],
        resolve: {
          ...config.resolve,
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
      }
    },
  },
  devServer: {
    open: false,
    port: 4200,
  },
  jest: {
    configure: (config: any) => {
      config.resolver = "@nx/jest/plugins/resolver"
      return {
        ...config,
        globals: {
          ...JEST_GLOBALS,
        },
      }
    },
  },
}

export default config
