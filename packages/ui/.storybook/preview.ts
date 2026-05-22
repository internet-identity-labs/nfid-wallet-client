import { INITIAL_VIEWPORTS } from "storybook/viewport"

import "./tailwind.css"

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    options: INITIAL_VIEWPORTS,
  },
}
export const tags = ["autodocs"]
