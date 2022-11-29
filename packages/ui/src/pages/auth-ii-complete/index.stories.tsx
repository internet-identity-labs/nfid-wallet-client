import { Meta, Story } from "@storybook/react"

import { SDKTemplate } from "../../templates/sdk-template"
import { IIAuthAddRemoteDevice, IIAuthAddRemoteDeviceProps } from "./index"

const meta: Meta = {
  title: "Pages/IIAuthAddRemoteDevice",
  component: IIAuthAddRemoteDevice,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<IIAuthAddRemoteDeviceProps> = (args) => (
  <SDKTemplate>
    <IIAuthAddRemoteDevice {...args} />
  </SDKTemplate>
)

export const Default = Template.bind({})

Default.args = {}
