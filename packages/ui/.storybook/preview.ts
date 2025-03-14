import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport"

import "./tailwind.css"

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
}
export const tags = ["autodocs"]
