import { Meta, StoryFn } from "@storybook/react-webpack5"

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

const Template: StoryFn<ICopy> = (args) => <Copy {...args} />

export const Default = Template.bind({
  copyTitle: "Copy title",
})

Default.args = {
  copyTitle: "Copy title",
}
