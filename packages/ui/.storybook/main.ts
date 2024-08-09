import type { StorybookConfig } from "@storybook/react-webpack5"

const config: StorybookConfig = {
  core: {},

  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: [
    "@storybook/addon-essentials",
    "@nx/react/plugins/storybook",
    "storybook-addon-remix-react-router",
    "@chromatic-com/storybook",
  ],

  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },

  docs: {},

  typescript: {
    reactDocgen: "react-docgen-typescript",
  },

  webpackFinal: async (config) => {
    config.resolve!.fallback = {
      ...config.resolve!.fallback,
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert/"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify/browser"),
      url: require.resolve("url/"),
      vm: require.resolve("vm-browserify"),
    }

    config.module!.rules!.push({
      test: /\.css$/,
      use: ["style-loader", "css-loader"],
      include: /packages\/ui\/src/,
    })

    return config
  },
}

module.exports = config

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs
