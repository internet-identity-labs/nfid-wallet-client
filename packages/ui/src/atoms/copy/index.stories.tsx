import { Meta, Story } from "@storybook/react"

import { Copy, ICopy } from "./index"

const meta: Meta = {
  title: "Atoms/Copy",
  component: Copy,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<ICopy> = (args) => <Copy {...args} />

export const Default = Template.bind({
  copyTitle: "Copy title",
})

Default.args = {
  copyTitle: "Copy title",
}
