// import {} from "@craco/craco"
import { IgnorePlugin, ProvidePlugin } from "webpack"
import path from "path"
import dfxJson from "./dfx.json"
import { config as loadEnv } from "dotenv"

loadEnv({ path: path.resolve(__dirname, ".env.local") })

// Gets the port dfx is running on from dfx.json
const DFX_PORT = dfxJson.networks.local.bind.split(":")[1]

const config = {
  webpack: {
    alias: {
      frontend: path.resolve(__dirname, "src"),
      components: path.resolve(__dirname, "src/ui-kit/src/components"),
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
