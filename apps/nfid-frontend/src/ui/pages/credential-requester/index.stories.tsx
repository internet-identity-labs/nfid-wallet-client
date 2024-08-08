import { StoryFn, Meta } from "@storybook/react"

import logo from "frontend/assets/distrikt.svg"

import { CredentialRequesterNotVerified } from "./not-verified"
import { CredentialRequesterSMSVerify } from "./sms-verify"
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
    phone: "+380977118615",
  },
} as Meta<typeof CredentialRequesterNotVerified>

const CredentialRequesterVerifiedTemplate: StoryFn<
  typeof CredentialRequesterVerified
> = (args) => {
  return <CredentialRequesterVerified {...args} />
}

const CredentialRequesterNotVerifiedTemplate: StoryFn<
  typeof CredentialRequesterNotVerified
> = (args) => {
  return <CredentialRequesterNotVerified {...args} />
}

const CredentialRequesterSMSVerifyTemplate: StoryFn<
  typeof CredentialRequesterSMSVerify
> = (args) => {
  return <CredentialRequesterSMSVerify {...args} />
}

export const VerifiedScreen = {
  render: CredentialRequesterVerifiedTemplate,
}
export const NotVerifiedScreen = {
  render: CredentialRequesterNotVerifiedTemplate,
}
export const SMSVerifyScreen = {
  render: CredentialRequesterSMSVerifyTemplate,
}
