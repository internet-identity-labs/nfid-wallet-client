import { Meta, Story } from "@storybook/react"
import React from "react"

import { ThirdPartyTemplate } from "../../templates/sdk-template"
import { IIAuthRecovery, AuthRecoveryIIProps } from "./index"

const meta: Meta = {
  title: "Pages/IIAuthRecovery",
  component: IIAuthRecovery,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<AuthRecoveryIIProps> = (args) => (
  <ThirdPartyTemplate>
    <IIAuthRecovery {...args} />
  </ThirdPartyTemplate>
)

export const Default = Template.bind({})

Default.args = {}
