import { Meta, Story } from "@storybook/react"
import { IconCmpPlus } from "packages/ui/src/atoms/icons"

import { VaultActionBar, VaultActionBarProps } from "./index"

const meta: Meta = {
  title: "Molecules/VaultActionBar",
  component: VaultActionBar,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<VaultActionBarProps> = (args) => (
  <VaultActionBar {...args} />
)

export const Default = Template.bind({})

Default.args = {
  actionButtons: (
    <div className="flex items-center space-x-2 font-bold text-blue-600 cursor-pointer">
      <IconCmpPlus />
      <span className="hidden sm:block">Add member</span>
    </div>
  ),
}
