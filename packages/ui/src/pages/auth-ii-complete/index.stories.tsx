import { Meta, StoryFn } from "@storybook/react"

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

const Template: StoryFn<IIAuthAddRemoteDeviceProps> = (args) => (
  <ThirdPartyTemplate>
    <IIAuthAddRemoteDevice {...args} />
  </ThirdPartyTemplate>
)

export const Default = {
  render: Template,
  args: {},
}
