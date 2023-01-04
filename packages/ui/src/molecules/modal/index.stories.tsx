import { Meta, Story } from "@storybook/react"
import React from "react"

import { ModalAdvanced, ModalAdvancedProps } from "./index"

const meta: Meta = {
  title: "Molecules/ModalAdvanced",
  component: ModalAdvanced,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<ModalAdvancedProps> = (args) => (
  <ModalAdvanced {...args}>Content here</ModalAdvanced>
)

export const Default = Template.bind({})

Default.args = {
  title: "Modal title",
  primaryButton: {
    text: "Approve",
    type: "primary",
    onClick: () => [],
  },
  secondaryButton: {
    text: "Cancel",
    type: "stroke",
    onClick: () => [],
  },
}
