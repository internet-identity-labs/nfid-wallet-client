import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"
import { ToastContainer } from "react-toastify"

import { APP_ACC_BALANCE_SHEET } from "frontend/features/fungible-token/icp/hooks/use-balance-icp-all.mocks"
import { ToastIcons } from "frontend/ui/atoms/toast-icons"

import TokenWalletsDetailPage from "."

export default {
  title: "Screens/NewProfile/InternetComputerWallets",
  component: TokenWalletsDetailPage,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof TokenWalletsDetailPage>

const Template: ComponentStory<typeof TokenWalletsDetailPage> = (args) => {
  return (
    <Router>
      <ToastContainer icon={({ type }) => ToastIcons[type]} />
      <TokenWalletsDetailPage {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {
  balanceSheet: APP_ACC_BALANCE_SHEET["ICP"],
}
