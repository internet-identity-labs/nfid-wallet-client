import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { AppScreenAuthorizeAppUnknownDevice } from "./screen-app"

export default {
  title: "Screens/AuthorizeAppUnknownDevice",
  component: AppScreenAuthorizeAppUnknownDevice,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AppScreenAuthorizeAppUnknownDevice>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof AppScreenAuthorizeAppUnknownDevice
> = (args) => {
  return (
    <Router>
      <AppScreenAuthorizeAppUnknownDevice {...args} />
    </Router>
  )
}

export const AppScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

AppScreen.args = {
  applicationName: "My Application",
  url: "https://nfid.one/secret/scope/my-application",
  isLoading: false,
  registerDeviceDeciderPath: "/register-device-decider",
}
