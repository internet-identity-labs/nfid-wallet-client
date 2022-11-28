import { Meta, Story } from "@storybook/react"
import React from "react"
import { ImPlus, ImSpinner } from "react-icons/im"

import { Button, ButtonProps } from "."
import { IconLaptop } from "../icons/desktop"

const meta: Meta = {
  title: "Atoms/Button",
  component: Button,
  argTypes: {
    onClick: { action: "clicked" },
    children: {
      control: {
        type: "text",
      },
    },
    disabled: { control: { type: "boolean" } },
    type: {
      options: ["primary", "secondary", "stroke", "ghost", "red"],
      control: { type: "radio" },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const DefaultTemplate: Story<ButtonProps> = (args) => {
  return (
    <div className="flex space-x-8">
      <Button {...args} />
      <Button {...args} icon={<ImSpinner />} />
      <Button {...args} icon={<ImPlus />} children="" />
    </div>
  )
}

const IconTemplate: Story = (args) => (
  <Button {...args}>
    <IconLaptop />
  </Button>
)
export const Default = DefaultTemplate.bind({})
Default.args = {
  children: "Button",
}

export const Icon = IconTemplate.bind({})

Icon.args = {
  isActive: false,
  icon: true,
}
