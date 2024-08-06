import { Meta, StoryFn } from "@storybook/react"

import { ToggleButton } from "."

export default {
  title: "Molecules/ToggleButton",
  component: ToggleButton,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as Meta<typeof ToggleButton>

const ToggleButtonTemplate: StoryFn<typeof ToggleButton> = (args) => (
  <ToggleButton {...args} />
)

export const ToggleButtonComponent = ToggleButtonTemplate.bind({
  firstValue: "Token",
  secondValue: "NFT",
})
