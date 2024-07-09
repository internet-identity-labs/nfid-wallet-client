import { Meta, Story } from "@storybook/react"
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

const Template: Story<ITransferModalSuccess> = (args) => (
  <TransferTemplate>
    <Success {...args} />
  </TransferTemplate>
)

export const Default = Template.bind({})

Default.args = {
  title: "1.0047 ETH",
  subTitle: "$1,866.24",
  assetImg: "",
  isAssetPadding: true,
  step: 1,
}
