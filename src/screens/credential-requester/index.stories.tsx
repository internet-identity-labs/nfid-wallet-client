import { ComponentStory, ComponentMeta } from "@storybook/react"

import logo from "frontend/assets/distrikt.svg"

import { CredentialRequesterNotVerified } from "./not-verified"
import { CredentialRequesterVerified } from "./verified"

export default {
  title: "Screens/Credential Requester",
  component: CredentialRequesterNotVerified,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
  args: {
    onPresent: () => {},
    applicationName: "Distrikt",
    applicationLogo: logo,
  },
} as ComponentMeta<typeof CredentialRequesterNotVerified>

const CredentialRequesterVerifiedTemplate: ComponentStory<
  typeof CredentialRequesterVerified
> = (args) => {
  return <CredentialRequesterVerified {...args} />
}

const CredentialRequesterNotVerifiedTemplate: ComponentStory<
  typeof CredentialRequesterNotVerified
> = (args) => {
  return <CredentialRequesterNotVerified {...args} />
}

export const VerifiedScreen = CredentialRequesterVerifiedTemplate.bind({})
export const NotVerifiedScreen = CredentialRequesterNotVerifiedTemplate.bind({})
