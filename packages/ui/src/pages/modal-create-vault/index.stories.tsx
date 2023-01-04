import { Meta, Story } from "@storybook/react"
import React from "react"

import { VaultModalCreate, VaultModalCreateProps } from "./index"

const meta: Meta = {
  title: "Pages/VaultModalCreate",
  component: VaultModalCreate,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<VaultModalCreateProps> = (args) => (
  <VaultModalCreate {...args} />
)

export const Default = Template.bind({})

Default.args = {}
