import { Meta, StoryFn } from "@storybook/react"
import React, { useState } from "react"

import { DropdownSelect, IDropdownSelect } from "."
import CollectionIcon from "./collection.png"

const meta: Meta = {
  title: "Atoms/DropdownSelect",
  component: DropdownSelect,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<IDropdownSelect> = (args) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  return (
    <div className="w-full h-screen p-4 bg-gray-100">
      <DropdownSelect
        {...args}
        selectedValues={selectedValues}
        setSelectedValues={setSelectedValues}
      />
    </div>
  )
}
const CollectionsTemplate: StoryFn<IDropdownSelect> = (args) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  return (
    <div className="w-full h-screen p-4 bg-gray-100">
      <DropdownSelect
        {...args}
        selectedValues={selectedValues}
        setSelectedValues={setSelectedValues}
      />
    </div>
  )
}

export const DefaultMolecules = {
  render: Template,

  args: {
    label: "Wallets",
    options: Array(14)
      .fill(null)
      .map((a, i) => ({
        label: `DSCVR account ${i}`,
        afterLabel: i + 1,
        value: `${i}`,
      })),
  },
}

export const CollectionsMolecules = {
  render: CollectionsTemplate,

  args: {
    label: "Wallets",
    options: Array(14)
      .fill(null)
      .map((a, i) => ({
        label: `DSCVR account ${i}`,
        afterLabel: i + 1,
        value: `${i}`,
        icon: CollectionIcon,
      })),
    isSearch: true,
  },
}
