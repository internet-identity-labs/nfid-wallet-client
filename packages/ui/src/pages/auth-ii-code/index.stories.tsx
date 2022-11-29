import { Meta, Story } from "@storybook/react"
import React from "react"

import { SDKTemplate } from "../../templates/sdk-template"
import { IIAuthCode, IIAuthCodeProps } from "./index"

const meta: Meta = {
  title: "Pages/IIAuthCode",
  component: IIAuthCode,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<IIAuthCodeProps> = (args) => (
  <SDKTemplate>
    <IIAuthCode {...args} />
  </SDKTemplate>
)

export const Default = Template.bind({})

Default.args = {
  secureCode: "123456",
  anchor: 20176,
}
