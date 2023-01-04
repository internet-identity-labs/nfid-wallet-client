import { Meta, Story } from "@storybook/react"
import React from "react"

import { VaultModalDeleteMember, VaultModalDeleteMemberProps } from "."

const meta: Meta = {
  title: "Pages/VaultModalDeleteMember",
  component: VaultModalDeleteMember,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<VaultModalDeleteMemberProps> = (args) => (
  <VaultModalDeleteMember {...args} />
)

export const Default = Template.bind({})

Default.args = {
  userName: "Pavlo Ch",
}
