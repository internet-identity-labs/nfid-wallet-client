import { Meta, Story } from "@storybook/react"
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

const Template: Story<IInputDropdown> = (args) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  return (
    <div className="w-full h-screen p-4 bg-gray-100">
      <InputDropdown
        {...args}
        selectedValues={selectedValues}
        setSelectedValues={setSelectedValues}
      />
    </div>
  )
}

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({})

Default.args = {
  label: "Wallets",
  placeholder: "Recipient principal or account ID",
  options: Array(14)
    .fill(null)
    .map((a, i) => ({
      label: `DSCVR account ${i}`,
      afterLabel: i + 1,
      value: `ajsfnsljbh_${i}`,
    })),
}
