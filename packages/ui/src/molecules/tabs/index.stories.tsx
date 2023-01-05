import { Meta, Story } from "@storybook/react"
import React from "react"

import { Tabs, TabsProps } from "./index"

const meta: Meta = {
  title: "Molecules/Tabs",
  component: Tabs,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<TabsProps> = (args) => (
  <div className="w-full">
    <Tabs {...args} />
  </div>
)

export const Default = Template.bind({})

Default.args = {
  tabs: [
    {
      label: "Transactions",
      value: "transactions",
      content: <div>Transactions content</div>,
    },
    {
      label: "Vaults",
      value: "vaults",
      content: <div>Vaults content</div>,
    },
  ],
  defaultValue: "transactions",
}
