import { Meta, StoryFn } from "@storybook/react"

import { SuccessProps, Success } from "./success"
import { TransferTemplate } from "./template"

const meta: Meta = {
  title: "Organisms/Send Receive/Success",
  component: Success,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<SuccessProps> = (args) => (
  <TransferTemplate>
    <Success {...args} />
  </TransferTemplate>
)

export const Default = {
  args: {
    title: "123",
  },
}
