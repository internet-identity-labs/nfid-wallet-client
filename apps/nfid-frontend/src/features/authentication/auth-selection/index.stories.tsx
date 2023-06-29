import { Meta, Story } from "@storybook/react"

import { AuthSelection, AuthSelectionProps } from "./index"

const meta: Meta = {
  title: "Auth/SignIn",
  component: AuthSelection,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

const Template: Story<AuthSelectionProps> = (args) => (
  <AuthSelection {...args} />
)

export const Default = Template.bind({})

Default.args = {}
