import { Meta, StoryFn } from "@storybook/react"
import React from "react"

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
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const IconTemplate: StoryFn = (args) => (
  <Button {...args}>
    <IconLaptop />
  </Button>
)

export const Default = {
  args: {
    children: "Button",
    primary: true,
  },
}

export const Icon = {
  render: IconTemplate,

  args: {
    isActive: false,
    icon: true,
  },
}
