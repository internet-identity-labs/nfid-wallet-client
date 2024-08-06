import { Meta, StoryFn } from "@storybook/react"
import React from "react"

import { Checkbox, ICheckbox } from "."

const meta: Meta = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<ICheckbox> = (args) => (
  <div className="w-full h-screen p-4 bg-gray-100">
    <Checkbox {...args} />
  </div>
)

export const Default = {
  render: Template,

  args: {
    labelText: "Date and time",
    value: "datetime",
  },
}
