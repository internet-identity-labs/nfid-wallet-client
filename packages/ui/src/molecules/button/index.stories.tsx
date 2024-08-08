import { Meta, StoryFn } from "@storybook/react"
import React from "react"
import { ImPlus, ImSpinner } from "react-icons/im"

import { Button, ButtonProps } from "."

const meta: Meta = {
  title: "Molecules/Button",
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

const DefaultTemplate: StoryFn<ButtonProps> = (args) => {
  return (
    <div className="flex space-x-8">
      <Button {...args} />
      <Button {...args} icon={<ImSpinner />} />
      <Button {...args} icon={<ImPlus />} children="" />
    </div>
  )
}

export const Default = {
  render: DefaultTemplate,

  args: {
    children: "Button",
    type: "primary",
    disabled: false,
    isSmall: false,
  },
}
