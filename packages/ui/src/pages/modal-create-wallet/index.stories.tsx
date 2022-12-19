import { Meta, Story } from "@storybook/react"
import React from "react"

import { VaultModalCreateWallet, VaultModalCreateWalletProps } from "./index"

const meta: Meta = {
  title: "Pages/VaultModalCreateWallet",
  component: VaultModalCreateWallet,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<VaultModalCreateWalletProps> = (args) => (
  <VaultModalCreateWallet {...args} />
)

export const Default = Template.bind({})

Default.args = {}
