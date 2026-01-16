import { StoryFn } from "@storybook/react"
import { ToastContainer } from "react-toastify"

import { ToastIcons } from "@nfid-frontend/ui"

import { AppAccountBalanceSheet } from "."

export default {
  title: "Organisms/AppAccountBalanceSheet",
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
}

const Template: StoryFn<typeof AppAccountBalanceSheet> = (args) => (
  <div>
    <ToastContainer icon={({ type }) => ToastIcons[type]} />
    <AppAccountBalanceSheet apps={args.apps} />
  </div>
)

export const Default = {
  render: Template,

  args: {},
}
