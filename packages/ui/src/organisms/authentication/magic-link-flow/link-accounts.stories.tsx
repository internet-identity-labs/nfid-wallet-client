import { Meta, StoryFn } from "@storybook/react"

import { IconCmpGoogle, Button } from "@nfid/ui"

import { withSignInDecorator } from "../../../decorators/sign-in"
import { EmailMagicLinkLink, EmailMagicLinkLinkProps } from "./link-accounts"

const meta: Meta = {
  title: "Auth/Previously registered email address",
  component: EmailMagicLinkLink,
  decorators: [withSignInDecorator],
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<EmailMagicLinkLinkProps> = (args) => (
  <EmailMagicLinkLink {...args} />
)

Default.args = {
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
