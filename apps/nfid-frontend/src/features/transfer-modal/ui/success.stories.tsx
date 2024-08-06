import { Meta, StoryFn } from "@storybook/react"
import React from "react"

import { ITransferModalSuccess, Success } from "./success"
import { TransferTemplate } from "./template"

const meta: Meta = {
  title: "Transfer/Success",
  component: Success,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<ITransferModalSuccess> = (args) => (
  <TransferTemplate>
    <Success {...args} />
  </TransferTemplate>
)

export const Default = {
  render: Template,
  args: {},
}
