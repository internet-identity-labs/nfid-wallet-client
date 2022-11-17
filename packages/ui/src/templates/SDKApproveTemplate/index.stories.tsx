import { Meta, Story } from "@storybook/react"
import React from "react"

import { SDKApproveTemplate, SDKApproveTemplateProps } from "./index"

const meta: Meta = {
  title: "Templates/SDKApproveTemplate",
  component: SDKApproveTemplate,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<SDKApproveTemplateProps> = (args) => (
  <SDKApproveTemplate {...args} />
)

export const Default = Template.bind({})

Default.args = {
  children: <div>123</div>,
  applicationName: "NFID Demo",
  successTimer: -1,
  isLoading: true,
}
