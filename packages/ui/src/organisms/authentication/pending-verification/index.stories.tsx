import { Meta, StoryFn } from "@storybook/react"

import { withSignInDecorator } from "@nfid/ui/decorators/sign-in"

import { AuthEmailPending, AuthEmailFlowProps } from "./index"

const meta: Meta = {
  title: "Auth/Pending Verification",
  component: AuthEmailPending,
  decorators: [withSignInDecorator],
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<AuthEmailFlowProps> = (args) => (
  <AuthEmailPending {...args} />
)

Default.args = {
  email: "example@google.com",
  onBack: () => console.log("Back button"),
  onResend: () => console.log("Resend button"),
}
