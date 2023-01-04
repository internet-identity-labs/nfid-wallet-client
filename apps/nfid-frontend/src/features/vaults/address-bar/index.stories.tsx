import { Meta, Story } from "@storybook/react"
import React from "react"

import { VaultAddressBar, VaultAddressBarProps } from "."

const meta: Meta = {
  title: "Pages/VaultAddressBar",
  component: VaultAddressBar,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<VaultAddressBarProps> = (args) => (
  <VaultAddressBar {...args} />
)

export const Default = Template.bind({})

Default.args = {}
