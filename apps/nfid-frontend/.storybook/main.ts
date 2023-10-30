const config = {
  core: { builder: "webpack5" },
  stories: [
    "../src/features/**/*.stories.mdx",
    "../src/features/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@nx/react/plugins/storybook",
    "storybook-addon-react-router-v6",
  ],
}

module.exports = config

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs
