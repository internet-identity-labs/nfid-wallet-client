import { ComponentStory } from "@storybook/react"

import { AppAccountBalanceSheet } from "."

export default {
  title: "Organisms/AppAccountBalanceSheet",
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
}

const Template: ComponentStory<typeof AppAccountBalanceSheet> = (args) => (
  <AppAccountBalanceSheet />
)

export const Default = Template.bind({})
Default.args = {}
