import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import logo from "frontend/assets/dfinity.svg"

import { AuthorizeAppUnknownDevice } from "./"

export default {
  title: "Screens/AuthorizeAppUnknownDeviceNew",
  component: AuthorizeAppUnknownDevice,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AuthorizeAppUnknownDevice>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof AuthorizeAppUnknownDevice
> = (args) => {
  return (
    <Router>
      <AuthorizeAppUnknownDevice {...args} />
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
