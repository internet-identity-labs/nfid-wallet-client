import { Meta, StoryFn } from "@storybook/react"
import React from "react"

import { Input, InputProps } from "."
import { IconCmpCalendar } from "../../atoms/icons"

const meta: Meta = {
  title: "Molecules/Input",
  component: Input,
  argTypes: {
    prependedText: {},
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<InputProps> = (args) => (
  <div className="flex flex-col gap-2">
    <Input {...args} />
    <Input type="password" {...args} />
  </div>
)

export const Default = {
  render: Template,

  args: {
    placeholder: "Placeholder",
    errorText: "",
    id: "test",
    icon: <IconCmpCalendar />,
    helperText: "helper text",
    labelText: "label text",
    disabled: false,
    innerText: "of 12",
  },
}
