import path from "path"
import ModuleScopePlugin from "react-dev-utils/ModuleScopePlugin"
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin"
import webpack from "webpack"

import { JEST_GLOBALS } from "../../config/jest-globals"
import { serviceConfig } from "../../config/webpack-env"

console.log(">> ", { serviceConfig })

const config = {
  webpack: {
    configure: (webpackConfig: any) => {
      // Remove guard against importing modules outside of `src`.
      // Needed for workspace projects.
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin: any) => !(plugin instanceof ModuleScopePlugin),
      )
      // Add support for importing workspace projects.
      webpackConfig.resolve.plugins.push(
        new TsConfigPathsPlugin({
          configFile: path.resolve(__dirname, "tsconfig.json"),
          extensions: [".ts", ".tsx", ".js", ".jsx"],
          mainFields: ["module", "main"],
        }),
      )

      // Replace include option for babel loader with exclude
      // so babel will handle workspace projects as well.
      webpackConfig.module.rules[1].oneOf.forEach((r: any) => {
        if (r.loader && r.loader.indexOf("babel") !== -1) {
          r.exclude = /node_modules/
          delete r.include
        }
      })
      return {
        ...webpackConfig,
        ignoreWarnings: [/Failed to parse source map from/],
        plugins: [
          ...webpackConfig.plugins,
          new webpack.DefinePlugin(serviceConfig),
          new webpack.ProvidePlugin({
            Buffer: [require.resolve("buffer/"), "Buffer"],
            process: require.resolve("process/browser"),
          }),
        ],
        resolve: {
          ...webpackConfig.resolve,
          fallback: {
            ...webpackConfig.resolve.fallback,
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
    configure: (jestConfig: any) => {
      jestConfig.resolver = "@nx/jest/plugins/resolver"
      return {
        ...jestConfig,
        globals: {
          ...JEST_GLOBALS,
        },
      }
    },
  },
}

export default config
