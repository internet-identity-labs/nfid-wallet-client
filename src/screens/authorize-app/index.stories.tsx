import { ComponentStory, ComponentMeta } from "@storybook/react"

import logo from "frontend/assets/distrikt.svg"

import { AuthorizeApp } from "."
import { AuthorizeAppIframe } from "./screen-iframe"

export default {
  title: "Screens/AuthorizeApp",
  component: AuthorizeApp,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AuthorizeApp>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof AuthorizeApp
> = (args) => {
  return <AuthorizeApp {...args} />
}

const AuthorizeAppIframeTemplate: ComponentStory<typeof AuthorizeAppIframe> = (
  args,
) => {
  return <AuthorizeAppIframe {...args} />
}

export const AppScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})
export const IframeScreen = AuthorizeAppIframeTemplate.bind({})

AppScreen.args = {
  applicationName: "My Application",
  accounts: [
    { persona_id: "1", domain: "https://my-app.ic0.app" },
    { persona_id: "2", domain: "https://my-app.ic0.app" },
    { persona_id: "3", domain: "https://my-app.ic0.app" },
  ],
}

IframeScreen.args = {
  applicationName: "Distrikt",
  applicationLogo: logo,
  accounts: [
    { persona_id: "1", domain: "https://my-app.ic0.app" },
    { persona_id: "2", domain: "https://my-app.ic0.app" },
    { persona_id: "3", domain: "https://my-app.ic0.app" },
  ],
}
