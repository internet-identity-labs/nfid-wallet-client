import { Meta, StoryFn } from "@storybook/react"
import { IconCmpGoogle } from "packages/ui/src/atoms/icons"
import { Button } from "packages/ui/src/molecules/button"

import { withSignInDecorator } from "../../../decorators/sign-in"
import { AuthSelection, AuthSelectionProps } from "./index"

const meta: Meta = {
  title: "Auth/SignIn",
  component: AuthSelection,
  decorators: [withSignInDecorator],
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<AuthSelectionProps> = (args) => (
  <AuthSelection {...args} />
)

Default.args = {
  appMeta: {
    name: "https://example.com",
  },
  authRequest: {
    hostname: "https://example.com",
  },
  onSelectEmailAuth: () => console.log("Login with Email button clicked"),
  onSelectOtherAuth: () => console.log("Other Auth button clicked"),
  onLoginWithPasskey: async () =>
    console.log("Login with Passkey button clicked"),
  isLoading: false,
  googleButton: (
    <Button
      onClick={() => console.log("Google Login button clicked")}
      id="google-sign-button"
      className="h-12 !p-0"
      type="stroke"
      icon={<IconCmpGoogle />}
      block
    >
      Continue with Google
    </Button>
  ),
}
