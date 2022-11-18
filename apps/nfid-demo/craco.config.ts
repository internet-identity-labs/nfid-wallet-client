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
        plugins: [...config.plugins, new webpack.DefinePlugin(serviceConfig)],
      }
    },
  },
  devServer: {
    open: false,
    port: 4200,
  },
  jest: {
    configure: (config: any) => {
      config.resolver = "@nrwl/jest/plugins/resolver"
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
