import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import {
  AuthorizeAppUnknownDeviceProps,
  RemoteAuthorizeAppUnknownDevice,
} from "."

export default {
  title: "Screens/AuthorizeAppUnknownDevice",
  component: RemoteAuthorizeAppUnknownDevice,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as Meta<typeof RemoteAuthorizeAppUnknownDevice>

const AppScreenRegisterDeviceDeciderTemplate: StoryFn<
  typeof RemoteAuthorizeAppUnknownDevice
> = (args: AuthorizeAppUnknownDeviceProps) => {
  return (
    <Router>
      <ScreenResponsive>
        <RemoteAuthorizeAppUnknownDevice {...args} />
      </ScreenResponsive>
    </Router>
  )
}

export const ResponsiveScreen = {
  render: AppScreenRegisterDeviceDeciderTemplate,

  args: {
    applicationName: "My Application",
    url: "https://nfid.one/secret/scope/my-application",
  },
}
