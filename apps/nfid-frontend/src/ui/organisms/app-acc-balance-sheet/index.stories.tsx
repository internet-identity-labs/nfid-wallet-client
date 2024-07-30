import { ComponentStory } from "@storybook/react"
import { ToastContainer } from "react-toastify"

import { APP_ACC_BALANCE_SHEET } from "frontend/features/fungible-token/icp/hooks/use-balance-icp-all.mocks"
import { ToastIcons } from "frontend/ui/atoms/toast-icons"

import { AppAccountBalanceSheet } from "."

export default {
  title: "Organisms/AppAccountBalanceSheet",
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
}

const Template: ComponentStory<typeof AppAccountBalanceSheet> = (args) => (
  <div>
    <ToastContainer icon={({ type }) => ToastIcons[type]} />
    <AppAccountBalanceSheet apps={args.apps} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  apps: Object.values(APP_ACC_BALANCE_SHEET.ICP.applications),
}
