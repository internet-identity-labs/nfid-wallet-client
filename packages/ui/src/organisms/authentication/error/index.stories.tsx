import { Meta, StoryFn } from "@storybook/react"
import { IconCmpGoogle } from "packages/ui/src/atoms/icons"
import { Button } from "packages/ui/src/molecules/button"

import { withSignInDecorator } from "../../../decorators/sign-in"
import { AuthEmailError, AuthEmailErrorProps } from "./index"

const meta: Meta = {
  title: "Auth/Email Error",
  component: AuthEmailError,
  decorators: [withSignInDecorator],
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<AuthEmailErrorProps> = (args) => (
  <AuthEmailError {...args} />
)

Default.args = {
  onBack: () => console.log("Back button clicked"),
  onResend: () => console.log("Resend button clicked"),
}
