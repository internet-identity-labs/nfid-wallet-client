import type { StorybookConfig } from "@storybook/core-common"

export const rootMain: StorybookConfig = {
  addons: [],
  stories: [],

  webpackFinal: async (config, { configType }) => {
    // Make whatever fine-grained changes you need that should apply to all storybook configs
    // Return the altered config
    return config
  },
}
export const core = {
  builder: "webpack5",
}
