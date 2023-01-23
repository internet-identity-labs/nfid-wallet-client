import { Meta, Story } from "@storybook/react"
import React from "react"

import { IframeTrustDevice, IIframeTrustDevice } from "./index"

const meta: Meta = {
  title: "Pages/IframeTrustDevice",
  component: IframeTrustDevice,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<IIframeTrustDevice> = (args) => (
  <IframeTrustDevice {...args} />
)

export const Default = Template.bind({})

Default.args = {
  isWebAuthN: true,
  onSkip: () => [],
  onTrust: () => [],
}
