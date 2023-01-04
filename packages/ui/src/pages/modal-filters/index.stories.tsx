import { Meta, Story } from "@storybook/react"
import React from "react"

import { VaultFilterTransactions, VaultFilterTransactionsProps } from "./index"

const meta: Meta = {
  title: "Pages/VaultFilterTransactions",
  component: VaultFilterTransactions,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<VaultFilterTransactionsProps> = (args) => (
  <VaultFilterTransactions {...args} />
)

export const Default = Template.bind({})

Default.args = {}
