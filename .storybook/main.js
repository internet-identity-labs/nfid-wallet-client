const path = require("path")
const webpack = require("webpack")

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/preset-create-react-app",
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-webpack5",
  },
  typescript: {
    check: true, // type-check stories during Storybook build
  },
  webpackFinal: async (config) => {
    const canisterEnv = {
      CURRCONV_TOKEN: JSON.stringify(process.env.CURRCONV_TOKEN),
      IC_HOST: JSON.stringify(process.env.IC_HOST),
      II_ENV: JSON.stringify(process.env.II_MODE),
      FRONTEND_MODE: JSON.stringify(process.env.FRONTEND_MODE),
      USERGEEK_API_KEY: JSON.stringify(process.env.USERGEEK_API_KEY),
      GOOGLE_CLIENT_ID: JSON.stringify(process.env.GOOGLE_CLIENT_ID),
      VERIFY_PHONE_NUMBER: JSON.stringify(
        process.env.FRONTEND_MODE === "production"
          ? process.env.AWS_VERIFY_PHONENUMBER
          : "/verify",
      ),
      SYMMETRIC: JSON.stringify(
        process.env.FRONTEND_MODE === "production"
          ? process.env.AWS_VERIFY_PHONENUMBER
          : "/symmetric",
      ),
      INTERNET_IDENTITY_CANISTER_ID: JSON.stringify(
        process.env[
          `INTERNET_IDENTITY_CANISTER_ID_${process.env.BACKEND_MODE}`
        ],
      ),
      IDENTITY_MANAGER_CANISTER_ID: JSON.stringify(
        process.env[`IDENTITY_MANAGER_CANISTER_ID_${process.env.BACKEND_MODE}`],
      ),
      PUB_SUB_CHANNEL_CANISTER_ID: JSON.stringify(
        process.env[`PUB_SUB_CHANNEL_CANISTER_ID_${process.env.BACKEND_MODE}`],
      ),
      VERIFIER_CANISTER_ID: JSON.stringify(
        process.env[`VERIFIER_CANISTER_ID_${process.env.BACKEND_MODE}`],
      ),
      LEDGER_CANISTER_ID: JSON.stringify(process.env[`LEDGER_CANISTER_ID`]),
      CYCLES_MINTER_CANISTER_ID: JSON.stringify(
        process.env[`LEDGER_CANISTER_ID`],
      ),
      CURRCONV_TOKEN: JSON.stringify(process.env[`CURRCONV_TOKEN`]),
      IS_DEV: JSON.stringify(process.env[`IS_DEV`]),
    }

    config.plugins.push(new webpack.DefinePlugin(canisterEnv))
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: [require.resolve("buffer/"), "Buffer"],
        process: require.resolve("process/browser"),
      }),
    )

    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, "../src"),
    ]

    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          frontend: path.resolve(__dirname, "../src"),
        },
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
}
