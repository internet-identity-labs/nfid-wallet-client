// import {} from "@craco/craco"
import CspHtmlWebpackPlugin from "@melloware/csp-webpack-plugin"
import path from "path"
import ModuleScopePlugin from "react-dev-utils/ModuleScopePlugin"
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin"
import webpack from "webpack"

import { serviceConfig } from "../../config/webpack-env"
import dfxJson from "../../dfx.json"

// Disable ESLint in webpack build to avoid conflicts with custom ESLint config
// ESLint is still run via lint-staged and NX lint commands
// This uses react-scripts' built-in DISABLE_ESLINT_PLUGIN environment variable
if (!process.env.DISABLE_ESLINT_PLUGIN) {
  process.env.DISABLE_ESLINT_PLUGIN = "true"
}

console.log("nfid-frontend", { serviceConfig })

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
        "https://*.ic0.app",
        "https://*.icp0.io",
        process.env.AWS_BASE_EP as string,
        "https://rosetta-api.internetcomputer.org",
        "https://free.currconv.com/",
        "https://us-central1-entrepot-api.cloudfunctions.net",
        "https://stats.g.doubleclick.net/g/collect",
        "https://registry.walletconnect.com",
        "wss://*.bridge.walletconnect.org",
        "https://mempool.space/",
        "https://api.blockcypher.com/",
        "https://api.coinbase.com",
        "https://api.pro.coinbase.com",
        "https://icp-api.io",
        "https://api.nftgeek.app",
        "https://toniq.io",
        "https://stat.yuku.app",
        "https://memecake.io",
        "https://web2.icptokens.net/api/tokens",
        "https://accounts.google.com/gsi/",
        "https://sepolia.infura.io/",
        "https://mainnet.infura.io/",
        "https://etherscan.io/",
        "https://api.etherscan.io/",
        "https://api-sepolia.etherscan.io/",
      ],
      "worker-src": "'self' blob:",
      "img-src": ["'self' blob: data: content: https:"],
      "font-src": [
        "'self'",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
      ],
      "frame-src": [
        "'self'",
        "https://*.ic0.app",
        "https://accounts.google.com/gsi/style",
        "https://accounts.google.com/",
      ],
      "manifest-src": "'self'",
      "style-src": [
        "'self'",
        // FIXME: libraries adding inline styles:
        // - google button
        "'unsafe-inline'",
        // FIXME: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        "https://accounts.google.com/gsi/style",
        "https://fonts.googleapis.com",
      ],
      "script-src": [
        "'self'",
        // FIXME: required for WebAssembly.instantiate()
        "'unsafe-eval'",
        "'sha256-6dv10xlkUu6+B73+WBPb1lJ7kFQFnr086T6FvXhkfHY='",
        "https://accounts.google.com/gsi/client",
      ],
      "require-trusted-types-for": ["'script'"],
      "media-src": ["'self'", process.env.NFID_PROVIDER_URL as string],
    }

    return [
      new CspHtmlWebpackPlugin(cspConfigPolicy, {
        // PrimeReact is a component library which is enabled by default,
        // but it is not used in the frontend. When it is enabled, it produces
        // a nonce within `style-src` which in turn disables `unsafe-inline`.
        primeReactEnabled: false,
        hashEnabled: {
          "style-src": false,
        },
        nonceEnabled: {
          "style-src": false,
        },
      }),
    ]
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
    configure: (config: any, { env: _env, paths: _paths }: any) => {
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
          modules: [
            ...(config.resolve.modules || ["node_modules"]),
            path.resolve(__dirname, "../../node_modules"),
          ],
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
      "/signin": {
        target: process.env.AWS_SIGNIN_GOOGLE,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/signin/, ""),
      },
      "/signin/v2": {
        target: process.env.AWS_SIGNIN_GOOGLE_V2,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/signin\/v2/, ""),
      },
      "/symmetric": {
        target: process.env.AWS_SYMMETRIC,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/symmetric/, ""),
      },
      "/exchange-rate": {
        target: process.env.AWS_EXCHANGE_RATE,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/exchange-rate/, ""),
      },
      "/x/tweet": {
        target: process.env.AWS_X_TWEET,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/x\/tweet/, ""),
      },
      "/signature": {
        target: process.env.AWS_SIGNATURE_EVENT,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/signature/, ""),
      },
      "/publickey": {
        target: process.env.AWS_PUBLIC_KEY,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/publickey/, ""),
      },
      "/ecdsa_register": {
        target: process.env.AWS_ECDSA_REGISTER,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/ecdsa_register/, ""),
      },
      "/ecdsa_register_address": {
        target: process.env.AWS_ECDSA_REGISTER_ADDRESS,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) =>
          path.replace(/^\/ecdsa_register_address/, ""),
      },
      "/execute_candid": {
        target: process.env.AWS_EXECUTE_CANDID,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/execute_candid/, ""),
      },
      "/ecdsa_get_anonymous": {
        target: process.env.AWS_ECDSA_GET_ANONYMOUS,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) =>
          path.replace(/^\/ecdsa_get_anonymous/, ""),
      },
      "/ecdsa_sign": {
        target: process.env.AWS_ECDSA_SIGN,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/ecdsa_sign/, ""),
      },
      "/passkey": {
        target: process.env.AWS_PASSKEY,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/passkey/, ""),
      },
      "/send_verification_email": {
        target: process.env.AWS_SEND_VERIFICATION_EMAIL,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) =>
          path.replace(/^\/send_verification_email/, ""),
      },
      "/link_google_account": {
        target: process.env.AWS_LINK_GOOGLE_ACCOUNT,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) =>
          path.replace(/^\/link_google_account/, ""),
      },
      "/check_verification": {
        target: process.env.AWS_CHECK_VERIFICATION,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) =>
          path.replace(/^\/check_verification/, ""),
      },
      "/verify_email": {
        target: process.env.AWS_VERIFY_EMAIL,
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/verify_email/, ""),
      },
      "/nft_geek_api": {
        target: "https://api.nftgeek.app",
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/nft_geek_api/, "/api"),
      },
      "/toniq_io": {
        target: "https://toniq.io",
        secure: true,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace(/^\/toniq_io/, "/"),
      },
    },
  },
}
export default config
