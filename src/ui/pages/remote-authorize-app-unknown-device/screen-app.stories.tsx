import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { RemoteAuthorizeAppUnknownDevice } from "."

export default {
  title: "Screens/AuthorizeAppUnknownDevice",
  component: RemoteAuthorizeAppUnknownDevice,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof RemoteAuthorizeAppUnknownDevice>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof RemoteAuthorizeAppUnknownDevice
> = (args) => {
  return (
    <Router>
      <RemoteAuthorizeAppUnknownDevice {...args} />
    </Router>
  )
}

export const ResponsiveScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

ResponsiveScreen.args = {
  applicationName: "My Application",
  url: "https://nfid.one/secret/scope/my-application",
  isLoading: false,
  registerDeviceDeciderPath: "/register-device-decider",
}
