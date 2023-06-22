import { Meta, Story } from "@storybook/react"

import { AuthSignIn, AuthSignInProps } from "./index"

const meta: Meta = {
  title: "Auth/SignIn",
  component: AuthSignIn,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

const Template: Story<AuthSignInProps> = (args) => <AuthSignIn {...args} />

export const Default = Template.bind({})

Default.args = {}
