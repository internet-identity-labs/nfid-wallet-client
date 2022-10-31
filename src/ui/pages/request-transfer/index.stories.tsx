import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import logo from "frontend/assets/distrikt.svg"

import { RequestTransferPage } from "."

export default {
  title: "Screens/Wallet/RequestTransferPage",
  component: RequestTransferPage,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof RequestTransferPage>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof RequestTransferPage
> = (args) => {
  return (
    <Router>
      <RequestTransferPage {...args} />
    </Router>
  )
}

export const ResponsiveScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

ResponsiveScreen.args = {
  applicationName: "My Application",
  applicationLogo: logo,
  amountICP: 19.0765312,
  amountUSD: "95.02",
  walletOptions: [],
  isSuccess: false,
  onReject: () => window.close(),
}
