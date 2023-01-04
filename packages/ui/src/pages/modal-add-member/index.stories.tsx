import { Meta, Story } from "@storybook/react"
import React from "react"

import { VaultModalAddMember, VaultModalAddMemberProps } from "./index"

const meta: Meta = {
  title: "Pages/VaultModalAddMember",
  component: VaultModalAddMember,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<VaultModalAddMemberProps> = (args) => (
  <VaultModalAddMember {...args} />
)

export const Default = Template.bind({})

Default.args = {}
