import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import logo from "frontend/assets/distrikt.svg"

import { AuthorizeApp } from "."
import { AuthorizeAppSingleAccount } from "./single-account"

export default {
  title: "Screens/AuthorizeApp",
  component: AuthorizeApp,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
  subcomponents: { AuthorizeAppSingleAccount },
} as ComponentMeta<typeof AuthorizeApp>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof AuthorizeApp
> = (args) => {
  return (
    <ScreenResponsive>
      <AuthorizeApp {...args} />
    </ScreenResponsive>
  )
}

const AuthorizeAppIframeTemplate: ComponentStory<typeof AuthorizeApp> = (
  args,
) => {
  return <AuthorizeApp {...args} />
}

const AuthorizeAppSingleAccountTemplate: ComponentStory<
  typeof AuthorizeAppSingleAccount
> = (args) => {
  return (
    <Router>
      <AuthorizeAppSingleAccount {...args} />
    </Router>
  )
}

export const AppScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})
export const SingleAccount = AuthorizeAppSingleAccountTemplate.bind({})
export const IframeScreen = AuthorizeAppIframeTemplate.bind({})

SingleAccount.args = {
  applicationName: "Distrikt",
  applicationLogo: logo,
}

AppScreen.args = {
  applicationName: "My Application",
  applicationLogo: logo,
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
  accountsLimit: 4,
}
