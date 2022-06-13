import { ComponentStory, ComponentMeta } from "@storybook/react"

import logo from "frontend/assets/distrikt.svg"

import { CredentialRequesterNotVerified } from "./not-verified"

export default {
  title: "Screens/Credential Requester",
  component: CredentialRequesterNotVerified,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof CredentialRequesterNotVerified>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof CredentialRequesterNotVerified
> = (args) => {
  return <CredentialRequesterNotVerified {...args} />
}

export const NotVerifiedScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

NotVerifiedScreen.args = {
  applicationName: "Distrikt",
  applicationLogo: logo,
}
