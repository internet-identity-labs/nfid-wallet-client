import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import logo from "frontend/assets/dfinity.svg"

import { AuthorizeDecider } from "."

export default {
  title: "Screens/AuthorizeAppUnknownDeviceNew",
  component: AuthorizeDecider,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AuthorizeDecider>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof AuthorizeDecider
> = (args) => {
  return (
    <Router>
      <AuthorizeDecider {...args} />
    </Router>
  )
}

export const AppScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

AppScreen.args = {
  applicationName: "My Application",
  applicationLogo: logo,
  url: "https://nfid.one/secret/scope/my-application",
  isLoading: false,
  registerDeviceDeciderPath: "/register-device-decider",
}
