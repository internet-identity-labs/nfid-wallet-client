import { Meta, Story } from "@storybook/react"

import { ThirdPartyTemplate } from "../../templates/sdk-template"
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
  <ThirdPartyTemplate>
    <IIAuthAddRemoteDevice {...args} />
  </ThirdPartyTemplate>
)

export const Default = Template.bind({})

Default.args = {}
