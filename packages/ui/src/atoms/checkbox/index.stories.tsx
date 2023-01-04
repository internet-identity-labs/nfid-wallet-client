import { Meta, Story } from "@storybook/react"
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

const Template: Story<ICheckbox> = (args) => (
  <div className="w-full h-screen p-4 bg-gray-100">
    <Checkbox {...args} />
  </div>
)

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({})

<<<<<<< HEAD
Default.args = {}
=======
Default.args = {
  labelText: "Date and time",
  value: "datetime",
}
>>>>>>> 76f9d305 (feat: added checkbox component)
