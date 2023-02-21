import type { StorybookConfig, Options } from "@storybook/core-common"

import { rootMain } from "../../../.storybook/main"

const config: StorybookConfig = {
  ...rootMain,

  core: { ...rootMain.core, builder: "webpack5" },

  stories: [
    ...rootMain.stories,
    "../src/features/**/*.stories.mdx",
    "../src/features/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    ...(rootMain.addons || []),
    "@nrwl/react/plugins/storybook",
  ],
  webpackFinal: async (config, { configType }: Options) => {
    // apply any global webpack configs that might have been specified in .storybook/main.ts
    if (rootMain.webpackFinal) {
      config = await rootMain.webpackFinal(config, { configType } as Options)
    }

    // add your own webpack tweaks if needed

    return config
  },
}

module.exports = config
