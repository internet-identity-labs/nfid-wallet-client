import { StoryFn } from "@storybook/react"
import { ToastContainer } from "react-toastify"

import { ToastIcons } from "@nfid/ui"

import { AppAccountBalanceSheet } from "."

export default {
  title: "Organisms/AppAccountBalanceSheet",
  parameters: {
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
