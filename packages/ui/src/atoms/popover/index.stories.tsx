import { Meta, Story } from "@storybook/react"
import React from "react"

import { IconCmpDots } from "../icons"
import { Popover, PopoverProps } from "./index"

const meta: Meta = {
  title: "Atoms/Popover",
  component: Popover,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<PopoverProps> = (args) => (
  <Popover {...args}>Some content here</Popover>
)

export const Default = Template.bind({})

Default.args = {
  trigger: <IconCmpDots />,
  position: "top",
}
