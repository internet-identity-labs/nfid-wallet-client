import { Meta, Story } from "@storybook/react"
import React from "react"

import { Chip, IChip } from "."

const meta: Meta = {
  title: "Atoms/Chip",
  component: Chip,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<IChip> = (args) => (
  <div className="w-full h-screen p-4 bg-gray-100">
    <Chip title="Hello" />
  </div>
)

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({})

Default.args = {}
