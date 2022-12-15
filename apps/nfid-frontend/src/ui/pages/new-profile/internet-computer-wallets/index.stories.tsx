import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"
import { ToastContainer } from "react-toastify"

import { APP_ACC_BALANCE_SHEET } from "frontend/features/fungable-token/icp/hooks/use-balance-icp-all.mocks"
import { ToastIcons } from "frontend/ui/atoms/toast-icons"

import InternetComputerWalletsPage from "."

export default {
  title: "Screens/NewProfile/InternetComputerWallets",
  component: InternetComputerWalletsPage,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof InternetComputerWalletsPage>

const Template: ComponentStory<typeof InternetComputerWalletsPage> = (args) => {
  return (
    <Router>
      <ToastContainer icon={({ type }) => ToastIcons[type]} />
      <InternetComputerWalletsPage {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {
  icpBlanceSheet: APP_ACC_BALANCE_SHEET,
}
