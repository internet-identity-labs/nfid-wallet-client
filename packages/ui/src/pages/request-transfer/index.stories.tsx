import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { IRequestTransferPage, RequestTransferPage } from "."
import logo from "./distrikt.svg"

export default {
  title: "Screens/Wallet/RequestTransferPage",
  component: RequestTransferPage,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as Meta<typeof RequestTransferPage>

const AppScreenRegisterDeviceDeciderTemplate: StoryFn<
  typeof RequestTransferPage
> = (args: IRequestTransferPage) => {
  return (
    <Router>
      <RequestTransferPage {...args} />
    </Router>
  )
}

export const ResponsiveScreen = {
  render: AppScreenRegisterDeviceDeciderTemplate,

  args: {
    applicationName: "My Application",
    applicationLogo: logo,
    amountICP: 19.0765312,
    amountUSD: "95.02",
    walletOptions: [],
    onReject: () => window.close(),
  },
}
