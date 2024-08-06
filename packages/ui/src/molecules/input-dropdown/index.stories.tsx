import { Meta, StoryFn } from "@storybook/react"
import React, { useState } from "react"

import { InputDropdown, IInputDropdown } from "."
import CollectionIcon from "./collection.png"

const meta: Meta = {
  title: "Molecules/InputDropdown",
  component: InputDropdown,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<IInputDropdown> = (args) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  return (
    <div className="w-full h-screen p-4 bg-gray-100">
      <InputDropdown {...args} />
    </div>
  )
}

export const Default = {
  render: Template,

  args: {
    label: "Wallets",
    placeholder: "Recipient principal or account ID",
    options: Array(14)
      .fill(null)
      .map((a, i) => ({
        label: `DSCVR account ${i}`,
        afterLabel: i + 1,
        value: `ajsfnsljbh_${i}`,
      })),
  },
}
