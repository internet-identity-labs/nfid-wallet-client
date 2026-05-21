import type { StorybookConfig } from "@storybook/react-webpack5"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config: StorybookConfig = {
  core: {},

  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: [
    "@storybook/addon-essentials",
    "@nx/react/plugins/storybook",
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
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      assert: "assert/",
      http: "stream-http",
      https: "https-browserify",
      os: "os-browserify/browser",
      url: "url/",
      vm: "vm-browserify",
    }

    config.module!.rules!.push({
      test: /\.css$/,
      use: ["style-loader", "css-loader"],
      include: /packages\/ui\/src/,
    })

    return config
  },
}

export default config

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs
