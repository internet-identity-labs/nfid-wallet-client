import { Meta, StoryFn } from "@storybook/react"
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

const Template: StoryFn<IChip> = (_args) => (
  <div className="w-full h-screen p-4 bg-gray-100">
    <Chip title="Hello" />
  </div>
)

export const Default = {
  render: Template,
  args: {},
}
