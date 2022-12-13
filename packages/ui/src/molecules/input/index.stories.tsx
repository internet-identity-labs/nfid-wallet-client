import { Meta, Story } from "@storybook/react"
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

const Template: Story<InputProps> = (args) => (
  <div className="flex flex-col gap-2">
    <Input {...args} />
    <Input type="password" {...args} />
  </div>
)

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({})

Default.args = {
  placeholder: "Placeholder",
  errorText: "",
  id: "test",
  icon: <IconCmpCalendar />,
  helperText: "helper text",
  labelText: "label text",
  disabled: false,
}
