import { Meta, StoryFn } from "@storybook/react"

import { withSignInDecorator } from "../../../decorators/sign-in"
import { AuthEmailVerified, AuthEmailVerifiedProps } from "./index"

const meta: Meta = {
  title: "Auth/Email Verified",
  component: AuthEmailVerified,
  decorators: [withSignInDecorator],
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<AuthEmailVerifiedProps> = (args) => (
  <AuthEmailVerified {...args} />
)

Default.args = {
  onContinue: () => console.log("Continue button clicked"),
}
