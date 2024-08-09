import { Meta, StoryFn } from "@storybook/react"

import { withSignInDecorator } from "../../../decorators/sign-in"
import { Auth2FA, IAuth2FA } from "./index"

const meta: Meta = {
  title: "Auth/2FA",
  component: Auth2FA,
  decorators: [withSignInDecorator],
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<IAuth2FA> = (args) => <Auth2FA {...args} />

Default.args = {
  appMeta: {
    name: "https://example.com",
  },
  isLoading: false,
  handleAuth: () => console.log("Continue button clicked"),
  email: "example@gmail.com",
}
