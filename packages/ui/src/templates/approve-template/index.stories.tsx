import { Meta, Story } from "@storybook/react"
import React from "react"

import { ApproveTemplate, ApproveTemplateProps } from "./index"

const meta: Meta = {
  title: "Templates/ApproveTemplate",
  component: ApproveTemplate,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<ApproveTemplateProps> = (args) => (
  <ApproveTemplate {...args} />
)

export const Default = Template.bind({})

Default.args = {
  children: <div>123</div>,
  applicationName: "NFID Demo",
  successTimer: -1,
  isLoading: true,
}
