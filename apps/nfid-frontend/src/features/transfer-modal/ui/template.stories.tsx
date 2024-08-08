import { Meta, StoryFn } from "@storybook/react"
import React from "react"

import { TransferTemplate } from "./template"

const meta: Meta = {
  title: "Transfer/Template",
  component: TransferTemplate,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

export const Default = {
  args: {
    children: "123",
  },
}
