import { Meta, Story } from "@storybook/react"
import React from "react"

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

const Template: Story<IDropdownSelect> = (args) => (
  <div className="w-full h-screen p-4 bg-gray-100">
    <DropdownSelect {...args} />
  </div>
)

const CollectionsTemplate: Story<IDropdownSelect> = (args) => (
  <div className="w-full h-screen p-4 bg-gray-100">
    <DropdownSelect {...args} />
  </div>
)

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({})
export const Collections = CollectionsTemplate.bind({})

Default.args = {
  label: "Wallets",
  options: Array(14)
    .fill(null)
    .map((a, i) => ({
      label: `DSCVR account ${i}`,
      afterLabel: i + 1,
      value: `${i}`,
    })),
}
Collections.args = {
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
}
