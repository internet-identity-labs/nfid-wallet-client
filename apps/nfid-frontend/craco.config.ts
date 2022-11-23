// import {} from "@craco/craco"
import CspHtmlWebpackPlugin from "@melloware/csp-webpack-plugin"
import path from "path"
import ModuleScopePlugin from "react-dev-utils/ModuleScopePlugin"
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin"
import webpack from "webpack"

import { serviceConfig } from "../../config/webpack-env"
import dfxJson from "../../dfx.json"

const isExampleBuild = process.env.EXAMPLE_BUILD === "1"

const setupCSP = () => {
  const isProduction = process.env.FRONTEND_MODE === "production"
  if (isProduction) {
    const cspConfigPolicy = {
      "default-src": "'none'",
      "object-src": "'none'",
      "base-uri": "'self'",
      "connect-src": [
        "'self'",
        "https://ic0.app",
        "https://region1.analytics.google.com",
        "https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/signin/",
        "https://rosetta-api.internetcomputer.org/",
        "https://free.currconv.com/", //api/v7/convert?q=XDR_USD&compact=ultra&apiKey=df6440fc0578491bb13eb2088c4f60c7"
        "https://us-central1-entrepot-api.cloudfunctions.net/", //api/maddies/getAllNfts/950fb7a3f9cfda1696366a5599f4feef2da94a50c283c57fe34e319f21509431"
      ],
      "worker-src": "'self'",
      "img-src": ["'self' blob: data: content:", "https://www.google.de"],
      "font-src": [
        "'self'",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
      ],
      "frame-src": [
        "'self'",
        "https://accounts.google.com/gsi/style",
        "https://accounts.google.com/",
      ],
      "manifest-src": "'self'",
      "style-src": [
        "'self'",
        // FIXME: libraries adding inline styles:
        // - react-tooltip
        // - google button
        "'unsafe-inline'",
        // FIXME: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        "https://fonts.googleapis.com",
        "https://accounts.google.com/gsi/style",
      ],
      "script-src": ["'strict-dynamic'"],
      "require-trusted-types-for": ["'script'"],
    }

    return [new CspHtmlWebpackPlugin(cspConfigPolicy)]
  }
  return []
}

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

      const isProduction = process.env.FRONTEND_MODE === "production"
      return {
        ...config,
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
          ...setupCSP(),
        ],
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
