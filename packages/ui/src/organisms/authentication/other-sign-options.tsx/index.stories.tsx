import { Meta, StoryFn } from "@storybook/react"

import { withSignInDecorator } from "../../../decorators/sign-in"
import { AuthOtherSignOptions, AuthOtherSignOptionsProps } from "./index"

const meta: Meta = {
  title: "Auth/Other Signin options",
  component: AuthOtherSignOptions,
  decorators: [withSignInDecorator],
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<AuthOtherSignOptionsProps> = (args) => {
  return (
    <AuthOtherSignOptions
      {...args}
      handleAuth={() => console.log("Continue button clicked")}
    />
  )
}

Default.args = {
  appMeta: "https://example.com",
  onBack: () => console.log("Back button clicked"),
}
