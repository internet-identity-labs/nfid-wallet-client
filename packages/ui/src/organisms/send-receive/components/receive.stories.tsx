import { Meta, StoryFn } from "@storybook/react"

import { ReceiveProps, Receive } from "./receive"
import { TransferTemplate } from "./template"

const meta: Meta = {
  title: "Organisms/Send Receive/Receive",
  component: Receive,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<ReceiveProps> = (args) => (
  <TransferTemplate>
    <Receive {...args} />
  </TransferTemplate>
)

export const Default = {
  args: {},
}
