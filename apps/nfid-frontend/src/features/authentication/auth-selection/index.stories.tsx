import { Meta, StoryFn } from "@storybook/react"

import { AuthSelection, AuthSelectionProps } from "./index"

const meta: Meta = {
  title: "Auth/SignIn",
  component: AuthSelection,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default = {
  args: {},
}
