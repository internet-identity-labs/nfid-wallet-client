import { Meta, StoryFn } from "@storybook/react"

import { withSignInDecorator } from "../../../decorators/sign-in"
import { EmailMagicLinkExpired } from "./expired"

const meta: Meta = {
  title: "Auth/Magic link with 2FA",
  component: EmailMagicLinkExpired,
  decorators: [withSignInDecorator],
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn = () => <EmailMagicLinkExpired />
