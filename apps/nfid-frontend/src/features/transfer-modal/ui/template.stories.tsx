import { Meta, Story } from "@storybook/react"
import React from "react"

import { TransferTemplate } from "./template"

const meta: Meta = {
  title: "Transfer/Template",
  component: TransferTemplate,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story = (args) => <TransferTemplate {...args} />

export const Default = Template.bind({})

Default.args = {
  children: "123",
}
