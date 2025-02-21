import { Meta, StoryFn } from "@storybook/react"

import { withSignInDecorator } from "../../../decorators/sign-in"
import { EmailMagicLinkSuccess } from "./success"

const meta: Meta = {
  title: "Auth/Magic link without self-sovereign mode",
  component: EmailMagicLinkSuccess,
  decorators: [withSignInDecorator],
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn = () => <EmailMagicLinkSuccess />
